---
section: "Framework Integrations: Electron, Next.js, NuxtJS, React Query, SvelteKit"
source: https://feature-sliced.design/llms-full.txt
copyright: "(c) 2018-2025 Feature-Sliced Design"
license: MIT
fetched_at: 2026-04-18
---

> Extracted from Feature-Sliced Design documentation (c) 2018-2025. MIT License.
> Full source: https://github.com/feature-sliced/documentation

# Usage with Electron

Electron applications have a special architecture consisting of multiple processes with different responsibilities. Applying FSD in such a context requires adapting the structure to the Electron specifics.

```
└── src
    ├── app                                 # Common app layer
    │   ├── main                            # Main process
    │   │   └── index.ts                    # Main process entry point
    │   ├── preload                         # Preload script and Context Bridge
    │   │   └── index.ts                    # Preload entry point
    │   └── renderer                        # Renderer process
    │       └── index.html                  # Renderer process entry point
    ├── main
    │   ├── features
    │   │   └── user
    │   │       └── ipc
    │   │           ├── get-user.ts
    │   │           └── send-user.ts
    │   ├── entities
    │   └── shared
    ├── renderer
    │   ├── pages
    │   │   ├── settings
    │   │   │   ├── ipc
    │   │   │   │   ├── get-user.ts
    │   │   │   │   └── save-user.ts
    │   │   │   ├── ui
    │   │   │   │   └── user.tsx
    │   │   │   └── index.ts
    │   │   └── home
    │   │       ├── ui
    │   │       │   └── home.tsx
    │   │       └── index.ts
    │   ├── widgets
    │   ├── features
    │   ├── entities
    │   └── shared
    └── shared                              # Common code between main and renderer
        └── ipc                             # IPC description (event names, contracts)
```

## Public API rules[​](#public-api-rules "Direct link to heading")

Each process must have its own public API. For example, you can't import modules from `main` to `renderer`. Only the `src/shared` folder is public for both processes. It's also necessary for describing contracts for process interaction.

## Additional changes to the standard structure[​](#additional-changes-to-the-standard-structure "Direct link to heading")

It's suggested to use a new `ipc` segment, where interaction between processes takes place. The `pages` and `widgets` layers, based on their names, should not be present in `src/main`. You can use `features`, `entities` and `shared`. The `app` layer in `src` contains entry points for `main` and `renderer`, as well as the IPC. It's not desirable for segments in the `app` layer to have intersection points

## Interaction example[​](#interaction-example "Direct link to heading")

src/shared/ipc/channels.ts

```
export const CHANNELS = {
    GET_USER_DATA: 'GET_USER_DATA',
    SAVE_USER: 'SAVE_USER',
} as const;

export type TChannelKeys = keyof typeof CHANNELS;
```

src/shared/ipc/events.ts

```
import { CHANNELS } from './channels';

export interface IEvents {
    [CHANNELS.GET_USER_DATA]: {
        args: void,
        response?: { name: string; email: string; };
    };
    [CHANNELS.SAVE_USER]: {
        args: { name: string; };
        response: void;
    };
}
```

src/shared/ipc/preload.ts

```
import { CHANNELS } from './channels';
import type { IEvents } from './events';

type TOptionalArgs<T> = T extends void ? [] : [args: T];

export type TElectronAPI = {
    [K in keyof typeof CHANNELS]: (...args: TOptionalArgs<IEvents[typeof CHANNELS[K]]['args']>) => IEvents[typeof CHANNELS[K]]['response'];
};
```

src/app/preload/index.ts

```
import { contextBridge, ipcRenderer } from 'electron';
import { CHANNELS, type TElectronAPI } from 'shared/ipc';

const API: TElectronAPI = {
    [CHANNELS.GET_USER_DATA]: () => ipcRenderer.sendSync(CHANNELS.GET_USER_DATA),
    [CHANNELS.SAVE_USER]: args => ipcRenderer.invoke(CHANNELS.SAVE_USER, args),
} as const;

contextBridge.exposeInMainWorld('electron', API);
```

src/main/features/user/ipc/send-user.ts

```
import { ipcMain } from 'electron';
import { CHANNELS } from 'shared/ipc';

export const sendUser = () => {
    ipcMain.on(CHANNELS.GET_USER_DATA, ev => {
        ev.returnValue = {
            name: 'John Doe',
            email: 'john.doe@example.com',
        };
    });
};
```

src/renderer/pages/user-settings/ipc/get-user.ts

```
import { CHANNELS } from 'shared/ipc';

export const getUser = () => {
    const user = window.electron[CHANNELS.GET_USER_DATA]();

    return user ?? { name: 'John Donte', email: 'john.donte@example.com' };
};
```

## See also[​](#see-also "Direct link to heading")

* [Process Model Documentation](https://www.electronjs.org/docs/latest/tutorial/process-model)
* [Context Isolation Documentation](https://www.electronjs.org/docs/latest/tutorial/context-isolation)
* [Inter-Process Communication Documentation](https://www.electronjs.org/docs/latest/tutorial/ipc)
* [Example](https://github.com/feature-sliced/examples/tree/master/examples/electron)


---

# Usage with Next.js

FSD is compatible with Next.js in both the App Router version and the Pages Router version if you solve the main conflict — the `app` and `pages` folders.

## App Router[​](#app-router "Direct link to heading")

### Conflict between FSD and Next.js in the `app` layer[​](#conflict-between-fsd-and-nextjs-in-the-app-layer "Direct link to heading")

Next.js suggests using the `app` folder to define application routes. It expects files in the `app` folder to correspond to pathnames. This routing mechanism **does not align** with the FSD concept, as it's not possible to maintain a flat slice structure.

The solution is to move the Next.js `app` folder to the project root and import FSD pages from `src`, where the FSD layers are, into the Next.js `app` folder.

You will also need to add a `pages` folder to the project root, otherwise Next.js will try to use `src/pages` as the Pages Router even if you use the App Router, which will break the build. It's also a good idea to put a `README.md` file inside this root `pages` folder describing why it is necessary, even though it's empty.

```
├── app                              # App folder (Next.js)
│   ├── api
│   │   └── get-example
│   │       └── route.ts
│   └── example
│       └── page.tsx
├── pages                            # Empty pages folder (Next.js)
│   └── README.md
└── src
    ├── app
    │   └── api-routes               # API routes
    ├── pages
    │   └── example
    │       ├── index.ts
    │       └── ui
    │           └── example.tsx
    ├── widgets
    ├── features
    ├── entities
    └── shared
```

Example of re-exporting a page from `src/pages` in the Next.js `app`:

app/example/page.tsx

```
export { ExamplePage as default, metadata } from '@/pages/example';
```

### Middleware[​](#middleware "Direct link to heading")

If you use middleware in your project, it must be located in the project root alongside the Next.js `app` and `pages` folders.

### Instrumentation[​](#instrumentation "Direct link to heading")

The `instrumentation.js` file allows you to monitor the performance and behavior of your application. If you use it, it must be located in the project root, similar to `middleware.js`.

## Pages Router[​](#pages-router "Direct link to heading")

### Conflict between FSD and Next.js in the `pages` layer[​](#conflict-between-fsd-and-nextjs-in-the-pages-layer "Direct link to heading")

Routes should be placed in the `pages` folder in the root of the project, similar to `app` folder for the App Router. The structure inside `src` where the layer folders are located remains unchanged.

```
├── pages                            # Pages folder (Next.js)
│   ├── _app.tsx
│   ├── api
│   │   └── example.ts               # API route re-export
│   └── example
│       └── index.tsx
└── src
    ├── app
    │   ├── custom-app
    │   │   └── custom-app.tsx       # Custom App component
    │   └── api-routes
    │       └── get-example-data.ts  # API route
    ├── pages
    │   └── example
    │       ├── index.ts
    │       └── ui
    │           └── example.tsx
    ├── widgets
    ├── features
    ├── entities
    └── shared
```

Example of re-exporting a page from `src/pages` in the Next.js `pages`:

pages/example/index.tsx

```
export { Example as default } from '@/pages/example';
```

### Custom `_app` component[​](#custom-_app-component "Direct link to heading")

You can place your Custom App component in `src/app/_app` or `src/app/custom-app`:

src/app/custom-app/custom-app.tsx

```
import type { AppProps } from 'next/app';

export const MyApp = ({ Component, pageProps }: AppProps) => {
    return (
        <>
            <p>My Custom App component</p>
            <Component { ...pageProps } />
        </>
    );
};
```

pages/\_app.tsx

```
export { App as default } from '@/app/custom-app';
```

## Route Handlers (API routes)[​](#route-handlers-api-routes "Direct link to heading")

Use the `api-routes` segment in the `app` layer to work with Route Handlers.

Be mindful when writing backend code in the FSD structure — FSD is primarily intended for frontends, meaning that's what people will expect to find. If you need a lot of endpoints, consider separating them into a different package in a monorepo.

* App Router
* Pages Router

src/app/api-routes/get-example-data.ts

```
import { getExamplesList } from '@/shared/db';

export const getExampleData = () => {
    try {
        const examplesList = getExamplesList();

        return Response.json({ examplesList });
    } catch {
        return Response.json(null, {
            status: 500,
            statusText: 'Ouch, something went wrong',
        });
    }
};
```

app/api/example/route.ts

```
export { getExampleData as GET } from '@/app/api-routes';
```

src/app/api-routes/get-example-data.ts

```
import type { NextApiRequest, NextApiResponse } from 'next';

const config = {
    api: {
        bodyParser: {
            sizeLimit: '1mb',
        },
    },
    maxDuration: 5,
};

const handler = (req: NextApiRequest, res: NextApiResponse<ResponseData>) => {
    res.status(200).json({ message: 'Hello from FSD' });
};

export const getExampleData = { config, handler } as const;
```

src/app/api-routes/index.ts

```
export { getExampleData } from './get-example-data';
```

app/api/example.ts

```
import { getExampleData } from '@/app/api-routes';

export const config = getExampleData.config;
export default getExampleData.handler;
```

## Additional recommendations[​](#additional-recommendations "Direct link to heading")

* Use the `db` segment in the `shared` layer to describe database queries and their further use in higher layers.
* Caching and revalidating queries logic is better kept in the same place as the queries themselves.

## See also[​](#see-also "Direct link to heading")

* [Next.js Project Structure](https://nextjs.org/docs/app/getting-started/project-structure)
* [Next.js Page Layouts](https://nextjs.org/docs/app/getting-started/layouts-and-pages)


---

# Usage with NuxtJS

It is possible to implement FSD in a NuxtJS project, but conflicts arise due to the differences between NuxtJS project structure requirements and FSD principles:

* Initially, NuxtJS offers a project file structure without a `src` folder, i.e. in the root of the project.
* The file routing is in the `pages` folder, while in FSD this folder is reserved for the flat slice structure.

## Adding an alias for the `src` directory[​](#adding-an-alias-for-the-src-directory "Direct link to heading")

Add an `alias` object to your config:

nuxt.config.ts

```
export default defineNuxtConfig({
  devtools: { enabled: true }, // Not FSD related, enabled at project startup
  alias: {
    "@": '../src'
  },
})
```

## Choose how to configure the router[​](#choose-how-to-configure-the-router "Direct link to heading")

In NuxtJS, there are two ways to customize the routing - using a config and using a file structure. In the case of file-based routing, you will create index.vue files in folders inside the app/routes directory, and in the case of configure, you will configure the routers in the `router.options.ts` file.

### Routing using config[​](#routing-using-config "Direct link to heading")

In the `app` layer, create a `router.options.ts` file, and export a config object from it:

app/router.options.ts

```
import type { RouterConfig } from '@nuxt/schema';

export default <RouterConfig> {
  routes: (_routes) => [],
};
```

To add a `Home` page to your project, you need to do the following steps:

* Add a page slice inside the `pages` layer
* Add the appropriate route to the `app/router.config.ts` config

To create a page slice, let's use the [CLI](https://github.com/feature-sliced/cli):

```
fsd pages home
```

Create a `home-page.vue` file inside the ui segment, access it using the Public API

src/pages/home/index.ts

```
export { default as HomePage } from './ui/home-page';
```

Thus, the file structure will look like this:

```
|── src
│   ├── app
│   │   ├── router.config.ts
│   ├── pages
│   │   ├── home
│   │   │   ├── ui
│   │   │   │   ├── home-page.vue
│   │   │   ├── index.ts
```

Finally, let's add a route to the config:

app/router.config.ts

```
import type { RouterConfig } from '@nuxt/schema'

export default <RouterConfig> {
  routes: (_routes) => [
    {
      name: 'home',
      path: '/',
      component: () => import('@/pages/home.vue').then(r => r.default || r)
    }
  ],
}
```

### File Routing[​](#file-routing "Direct link to heading")

First of all, create a `src` directory in the root of your project, and create app and pages layers inside this directory and a routes folder inside the app layer. Thus, your file structure should look like this:

```
├── src
│   ├── app
│   │   ├── routes
│   ├── pages                         # Pages folder, related to FSD
```

In order for NuxtJS to use the routes folder inside the `app` layer for file routing, you need to modify `nuxt.config.ts` as follows:

nuxt.config.ts

```
export default defineNuxtConfig({
  devtools: { enabled: true }, // Not FSD related, enabled at project startup
  alias: {
    "@": '../src'
  },
  dir: {
    pages: './src/app/routes'
  }
})
```

Now, you can create routes for pages within `app` and connect pages from `pages` to them.

For example, to add a `Home` page to your project, you need to do the following steps:

* Add a page slice inside the `pages` layer
* Add the corresponding route inside the `app` layer
* Connect the page from the slice with the route

To create a page slice, let's use the [CLI](https://github.com/feature-sliced/cli):

```
fsd pages home
```

Create a `home-page.vue` file inside the ui segment, access it using the Public API

src/pages/home/index.ts

```
export { default as HomePage } from './ui/home-page';
```

Create a route for this page inside the `app` layer:

```

├── src
│   ├── app
│   │   ├── routes
│   │   │   ├── index.vue
│   ├── pages
│   │   ├── home
│   │   │   ├── ui
│   │   │   │   ├── home-page.vue
│   │   │   ├── index.ts
```

Add your page component inside the `index.vue` file:

src/app/routes/index.vue

```
<script setup>
  import { HomePage } from '@/pages/home';
</script>

<template>
  <HomePage/>
</template>
```

## What to do with `layouts`?[​](#what-to-do-with-layouts "Direct link to heading")

You can place layouts inside the `app` layer, to do this you need to modify the config as follows:

nuxt.config.ts

```
export default defineNuxtConfig({
  devtools: { enabled: true }, // Not related to FSD, enabled at project startup
  alias: {
    "@": '../src'
  },
  dir: {
    pages: './src/app/routes',
    layouts: './src/app/layouts'
  }
})
```

## See also[​](#see-also "Direct link to heading")

* [Documentation on changing directory config in NuxtJS](https://nuxt.com/docs/api/nuxt-config#dir)
* [Documentation on changing router config in NuxtJS](https://nuxt.com/docs/guide/recipes/custom-routing#router-config)
* [Documentation on changing aliases in NuxtJS](https://nuxt.com/docs/api/nuxt-config#alias)


---

# Usage with React Query

## The problem of “where to put the keys”[​](#the-problem-of-where-to-put-the-keys "Direct link to heading")

### Solution — break down by entities[​](#solution--break-down-by-entities "Direct link to heading")

If the project already has a division into entities, and each request corresponds to a single entity, the purest division will be by entity. In this case, we suggest using the following structure:

```
└── src/                                        #
    ├── app/                                    #
    |   ...                                     #
    ├── pages/                                  #
    |   ...                                     #
    ├── entities/                               #
    |     ├── {entity}/                         #
    |    ...     └── api/                       #
    |                 ├── `{entity}.query`      # Query-factory where are the keys and functions
    |                 ├── `get-{entity}`        # Entity getter function
    |                 ├── `create-{entity}`     # Entity creation function
    |                 ├── `update-{entity}`     # Entity update function
    |                 ├── `delete-{entity}`     # Entity delete function
    |                ...                        #
    |                                           #
    ├── features/                               #
    |   ...                                     #
    ├── widgets/                                #
    |   ...                                     #
    └── shared/                                 #
        ...                                     #
```

If there are connections between the entities (for example, the Country entity has a field-list of City entities), then you can use the [public API for cross-imports](/docs/reference/public-api.md#public-api-for-cross-imports) or consider the alternative solution below.

### Alternative solution — keep it in shared[​](#alternative-solution--keep-it-in-shared "Direct link to heading")

In cases where entity separation is not appropriate, the following structure can be considered:

```
└── src/                                        #
   ...                                          #
    └── shared/                                 #
          ├── api/                              #
         ...   ├── `queries`                    # Query-factories
               |      ├── `document.ts`         #
               |      ├── `background-jobs.ts`  #
               |     ...                        #
               └──  index.ts                    #
```

Then in `@/shared/api/index.ts`:

@/shared/api/index.ts

```
export { documentQueries } from "./queries/document";
```

## The problem of “Where to insert mutations?”[​](#the-problem-of-where-to-insert-mutations "Direct link to heading")

It is not recommended to mix mutations with queries. There are two options:

### 1. Define a custom hook in the `api` segment near the place of use[​](#1-define-a-custom-hook-in-the-api-segment-near-the-place-of-use "Direct link to heading")

@/features/update-post/api/use-update-title.ts

```
export const useUpdateTitle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newTitle }) =>
      apiClient
        .patch(`/posts/${id}`, { title: newTitle })
        .then((data) => console.log(data)),

    onSuccess: (newPost) => {
      queryClient.setQueryData(postsQueries.ids(id), newPost);
    },
  });
};
```

### 2. Define a mutation function somewhere else (Shared or Entities) and use `useMutation` directly in the component[​](#2-define-a-mutation-function-somewhere-else-shared-or-entities-and-use-usemutation-directly-in-the-component "Direct link to heading")

```
const { mutateAsync, isPending } = useMutation({
  mutationFn: postApi.createPost,
});
```

@/pages/post-create/ui/post-create-page.tsx

```
export const CreatePost = () => {
  const { classes } = useStyles();
  const [title, setTitle] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: postApi.createPost,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setTitle(e.target.value);
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate({ title, userId: DEFAULT_USER_ID });
  };

  return (
    <form className={classes.create_form} onSubmit={handleSubmit}>
      <TextField onChange={handleChange} value={title} />
      <LoadingButton type="submit" variant="contained" loading={isPending}>
        Create
      </LoadingButton>
    </form>
  );
};
```

## Organization of requests[​](#organization-of-requests "Direct link to heading")

### Query factory[​](#query-factory "Direct link to heading")

A query factory is an object where the key values are functions that return a list of query keys. Here's how to use it:

```
const keyFactory = {
  all: () => ["entity"],
  lists: () => [...postQueries.all(), "list"],
};
```

info

`queryOptions` is a built-in utility in react-query\@v5 (optional)

```
queryOptions({
  queryKey,
  ...options,
});
```

For greater type safety, further compatibility with future versions of react-query, and easy access to functions and query keys, you can use the built-in queryOptions function from “@tanstack/react-query” [(More details here)](https://tkdodo.eu/blog/the-query-options-api#queryoptions).

### 1. Creating a Query Factory[​](#1-creating-a-query-factory "Direct link to heading")

@/entities/post/api/post.queries.ts

```
import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { getPosts } from "./get-posts";
import { getDetailPost } from "./get-detail-post";
import { PostDetailQuery } from "./query/post.query";

export const postQueries = {
  all: () => ["posts"],

  lists: () => [...postQueries.all(), "list"],
  list: (page: number, limit: number) =>
    queryOptions({
      queryKey: [...postQueries.lists(), page, limit],
      queryFn: () => getPosts(page, limit),
      placeholderData: keepPreviousData,
    }),

  details: () => [...postQueries.all(), "detail"],
  detail: (query?: PostDetailQuery) =>
    queryOptions({
      queryKey: [...postQueries.details(), query?.id],
      queryFn: () => getDetailPost({ id: query?.id }),
      staleTime: 5000,
    }),
};
```

### 2. Using Query Factory in application code[​](#2-using-query-factory-in-application-code "Direct link to heading")

```
import { useParams } from "react-router-dom";
import { postApi } from "@/entities/post";
import { useQuery } from "@tanstack/react-query";

type Params = {
  postId: string;
};

export const PostPage = () => {
  const { postId } = useParams<Params>();
  const id = parseInt(postId || "");
  const {
    data: post,
    error,
    isLoading,
    isError,
  } = useQuery(postApi.postQueries.detail({ id }));

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || !post) {
    return <>{error?.message}</>;
  }

  return (
    <div>
      <p>Post id: {post.id}</p>
      <div>
        <h1>{post.title}</h1>
        <div>
          <p>{post.body}</p>
        </div>
      </div>
      <div>Owner: {post.userId}</div>
    </div>
  );
};
```

### Benefits of using a Query Factory[​](#benefits-of-using-a-query-factory "Direct link to heading")

* **Request structuring:** A factory allows you to organize all API requests in one place, making your code more readable and maintainable.
* **Convenient access to queries and keys:** The factory provides convenient methods for accessing different types of queries and their keys.
* **Query Refetching Ability:** The factory allows easy refetching without the need to change query keys in different parts of the application.

## Pagination[​](#pagination "Direct link to heading")

In this section, we'll look at an example of the `getPosts` function, which makes an API request to retrieve post entities using pagination.

### 1. Creating a function `getPosts`[​](#1-creating-a-function-getposts "Direct link to heading")

The getPosts function is located in the `get-posts.ts` file, which is located in the `api` segment

@/pages/post-feed/api/get-posts.ts

```
import { apiClient } from "@/shared/api/base";

import { PostWithPaginationDto } from "./dto/post-with-pagination.dto";
import { PostQuery } from "./query/post.query";
import { mapPost } from "./mapper/map-post";
import { PostWithPagination } from "../model/post-with-pagination";

const calculatePostPage = (totalCount: number, limit: number) =>
  Math.floor(totalCount / limit);

export const getPosts = async (
  page: number,
  limit: number,
): Promise<PostWithPagination> => {
  const skip = page * limit;
  const query: PostQuery = { skip, limit };
  const result = await apiClient.get<PostWithPaginationDto>("/posts", query);

  return {
    posts: result.posts.map((post) => mapPost(post)),
    limit: result.limit,
    skip: result.skip,
    total: result.total,
    totalPages: calculatePostPage(result.total, limit),
  };
};
```

### 2. Query factory for pagination[​](#2-query-factory-for-pagination "Direct link to heading")

The `postQueries` query factory defines various query options for working with posts, including requesting a list of posts with a specific page and limit.

```
import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { getPosts } from "./get-posts";

export const postQueries = {
  all: () => ["posts"],
  lists: () => [...postQueries.all(), "list"],
  list: (page: number, limit: number) =>
    queryOptions({
      queryKey: [...postQueries.lists(), page, limit],
      queryFn: () => getPosts(page, limit),
      placeholderData: keepPreviousData,
    }),
};
```

### 3. Use in application code[​](#3-use-in-application-code "Direct link to heading")

@/pages/home/ui/index.tsx

```
export const HomePage = () => {
  const itemsOnScreen = DEFAULT_ITEMS_ON_SCREEN;
  const [page, setPage] = usePageParam(DEFAULT_PAGE);
  const { data, isFetching, isLoading } = useQuery(
    postApi.postQueries.list(page, itemsOnScreen),
  );
  return (
    <>
      <Pagination
        onChange={(_, page) => setPage(page)}
        page={page}
        count={data?.totalPages}
        variant="outlined"
        color="primary"
      />
      <Posts posts={data?.posts} />
    </>
  );
};
```

note

The example is simplified, the full version is available on [GitHub](https://github.com/ruslan4432013/fsd-react-query-example)

## `QueryProvider` for managing queries[​](#queryprovider-for-managing-queries "Direct link to heading")

In this guide, we will look at how to organize a `QueryProvider`.

### 1. Creating a `QueryProvider`[​](#1-creating-a-queryprovider "Direct link to heading")

The file `query-provider.tsx` is located at the path `@/app/providers/query-provider.tsx`.

@/app/providers/query-provider.tsx

```
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  client: QueryClient;
};

export const QueryProvider = ({ client, children }: Props) => {
  return (
    <QueryClientProvider client={client}>
      {children}
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};
```

### 2. Creating a `QueryClient`[​](#2-creating-a-queryclient "Direct link to heading")

`QueryClient` is an instance used to manage API requests. The `query-client.ts` file is located at `@/shared/api/query-client.ts`. `QueryClient` is created with certain settings for query caching.

@/shared/api/query-client.ts

```
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 5 * 60 * 1000,
    },
  },
});
```

## Code generation[​](#code-generation "Direct link to heading")

There are tools that can generate API code for you, but they are less flexible than the manual approach described above. If your Swagger file is well-structured, and you're using one of these tools, it might make sense to generate all the code in the `@/shared/api` directory.

## Additional advice for organizing RQ[​](#additional-advice-for-organizing-rq "Direct link to heading")

### API Client[​](#api-client "Direct link to heading")

Using a custom API client class in the shared layer, you can standardize the configuration and work with the API in the project. This allows you to manage logging, headers and data exchange format (such as JSON or XML) from one place. This approach makes it easier to maintain and develop the project because it simplifies changes and updates to interactions with the API.

@/shared/api/api-client.ts

```
import { API_URL } from "@/shared/config";

export class ApiClient {
  private baseUrl: string;

  constructor(url: string) {
    this.baseUrl = url;
  }

  async handleResponse<TResult>(response: Response): Promise<TResult> {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    try {
      return await response.json();
    } catch (error) {
      throw new Error("Error parsing JSON response");
    }
  }

  public async get<TResult = unknown>(
    endpoint: string,
    queryParams?: Record<string, string | number>,
  ): Promise<TResult> {
    const url = new URL(endpoint, this.baseUrl);

    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.append(key, value.toString());
      });
    }
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return this.handleResponse<TResult>(response);
  }

  public async post<TResult = unknown, TData = Record<string, unknown>>(
    endpoint: string,
    body: TData,
  ): Promise<TResult> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    return this.handleResponse<TResult>(response);
  }
}

export const apiClient = new ApiClient(API_URL);
```

## See also[​](#see-also "Direct link to heading")

* [(GitHub) Sample Project](https://github.com/ruslan4432013/fsd-react-query-example)
* [(CodeSandbox) Sample Project](https://codesandbox.io/p/github/ruslan4432013/fsd-react-query-example/main)
* [About the query factory](https://tkdodo.eu/blog/the-query-options-api)


---

# Usage with SvelteKit

It is possible to implement FSD in a SvelteKit project, but conflicts arise due to the differences between the structure requirements of a SvelteKit project and the principles of FSD:

* Initially, SvelteKit offers a file structure inside the `src/routes` folder, while in FSD the routing must be part of the `app` layer.
* SvelteKit suggests putting everything not related to routing in the `src/lib` folder.

## Let's set up the config[​](#lets-set-up-the-config "Direct link to heading")

svelte.config.ts

```
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config}*/
const config = {
  preprocess: [vitePreprocess()],
  kit: {
    adapter: adapter(),
    files: {
      routes: 'src/app/routes',             // move routing inside the app layer
      lib: 'src',
      appTemplate: 'src/app/index.html',    // Move the application entry point inside the app layer
      assets: 'public'
    },
    alias: {
      '@/*': 'src/*'                        // Create an alias for the src directory
    }
  }
};
export default config;
```

## Move file routing to `src/app`.[​](#move-file-routing-to-srcapp "Direct link to heading")

Let's create an app layer, move the app's entry point `index.html` into it, and create a routes folder. Thus, your file structure should look like this:

```
├── src
│   ├── app
│   │   ├── index.html
│   │   ├── routes
│   ├── pages                               # FSD Pages folder
```

Now, you can create routes for pages within `app` and connect pages from `pages` to them.

For example, to add a home page to your project, you need to do the following steps:

* Add a page slice inside the `pages` layer
* Add the corresponding rooute to the `routes` folder from the `app` layer
* Align the page from the slice with the rooute

To create a page slice, let's use the [CLI](https://github.com/feature-sliced/cli):

```
fsd pages home
```

Create a `home-page.svelte` file inside the ui segment, access it using the Public API

src/pages/home/index.ts

```
export { default as HomePage } from './ui/home-page.svelte';
```

Create a route for this page inside the `app` layer:

```

├── src
│   ├── app
│   │   ├── routes
│   │   │   ├── +page.svelte
│   │   ├── index.html
│   ├── pages
│   │   ├── home
│   │   │   ├── ui
│   │   │   │   ├── home-page.svelte
│   │   │   ├── index.ts
```

Add your page component inside the `+page.svelte` file:

src/app/routes/+page.svelte

```
<script>
  import { HomePage } from '@/pages/home';
</script>


<HomePage/>
```

## See also.[​](#see-also "Direct link to heading")

* [Documentation on changing directory config in SvelteKit](https://kit.svelte.dev/docs/configuration#files)


---



