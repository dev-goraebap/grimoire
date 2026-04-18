---
section: "Core Reference: Layers, Public API, Slices and Segments"
source: https://feature-sliced.design/llms-full.txt
copyright: "(c) 2018-2025 Feature-Sliced Design"
license: MIT
fetched_at: 2026-04-18
---

> Extracted from Feature-Sliced Design documentation (c) 2018-2025. MIT License.
> Full source: https://github.com/feature-sliced/documentation

# Layers

Layers are the first level of organisational hierarchy in Feature-Sliced Design. Their purpose is to separate code based on how much responsibility it needs and how many other modules in the app it depends on. Every layer carries special semantic meaning to help you determine how much responsibility you should allocate to your code.

There are **7 layers** in total, arranged from most responsibility and dependency to least:

![A file system tree, with a single root folder called src and then seven subfolders: app, processes, pages, widgets, features, entities, shared. The processes folder is slightly faded out.](/img/layers/folders-graphic-light.svg#light-mode-only) ![A file system tree, with a single root folder called src and then seven subfolders: app, processes, pages, widgets, features, entities, shared. The processes folder is slightly faded out.](/img/layers/folders-graphic-dark.svg#dark-mode-only)

1. App
2. Processes (deprecated)
3. Pages
4. Widgets
5. Features
6. Entities
7. Shared

You don't have to use every layer in your project — only add them if you think it brings value to your project. Typically, most frontend projects will have at least the Shared, Pages, and App layers.

In practice, layers are folders with lowercase names (for example, `📁 shared`, `📁 pages`, `📁 app`). Adding new layers is *not recommended* because their semantics are standardized.

## Import rule on layers[​](#import-rule-on-layers "Direct link to heading")

Layers are made up of *slices* — highly cohesive groups of modules. Dependencies between slices are regulated by **the import rule on layers**:

> *A module (file) in a slice can only import other slices when they are located on layers strictly below.*

For example, the folder `📁 ~/features/aaa` is a slice with the name "aaa". A file inside of it, `~/features/aaa/api/request.ts`, cannot import code from any file in `📁 ~/features/bbb`, but can import code from `📁 ~/entities` and `📁 ~/shared`, as well as any sibling code from `📁 ~/features/aaa`, for example, `~/features/aaa/lib/cache.ts`.

Layers App and Shared are **exceptions** to this rule — they are both a layer and a slice at the same time. Slices partition code by business domain, and these two layers are exceptions because Shared does not have business domains, and App combines all business domains.

In practice, this means that layers App and Shared are made up of segments, and segments can import each other freely.

## Layer definitions[​](#layer-definitions "Direct link to heading")

This section describes the semantic meaning of each layer to create an intuition for what kind of code belongs there.

### Shared[​](#shared "Direct link to heading")

This layer forms a foundation for the rest of the app. It's a place to create connections with the external world, for example, backends, third-party libraries, the environment. It is also a place to define your own highly contained libraries.

This layer, like the App layer, *does not contain slices*. Slices are intended to divide the layer into business domains, but business domains do not exist in Shared. This means that all files in Shared can reference and import from each other.

Here are the segments that you can typically find in this layer:

* `📁 api` — the API client and potentially also functions to make requests to specific backend endpoints.
* `📁 ui` — the application's UI kit.
  <br />
  <!-- -->
  Components on this layer should not contain business logic, but it's okay for them to be business-themed. For example, you can put the company logo and page layout here. Components with UI logic are also allowed (for example, autocomplete or a search bar).
* `📁 lib` — a collection of internal libraries.
  <br />
  <!-- -->
  This folder should not be treated as helpers or utilities ([read here why these folders often turn into a dump](https://dev.to/sergeysova/why-utils-helpers-is-a-dump-45fo)). Instead, every library in this folder should have one area of focus, for example, dates, colors, text manipulation, etc. That area of focus should be documented in a README file. The developers in your team should know what can and cannot be added to these libraries.
* `📁 config` — environment variables, global feature flags and other global configuration for your app.
* `📁 routes` — route constants or patterns for matching routes.
* `📁 i18n` — setup code for translations, global translation strings.

You are free to add more segments, but make sure that the name of these segments describes the purpose of the content, not its essence. For example, `components`, `hooks`, and `types` are bad segment names because they aren't that helpful when you're looking for code.

### Entities[​](#entities "Direct link to heading")

Slices on this layer represent concepts from the real world that the project is working with. Commonly, they are the terms that the business uses to describe the product. For example, a social network might work with business entities like User, Post, and Group.

An entity slice might contain the data storage (`📁 model`), data validation schemas (`📁 model`), entity-related API request functions (`📁 api`), as well as the visual representation of this entity in the interface (`📁 ui`). The visual representation doesn't have to produce a complete UI block — it is primarily meant to reuse the same appearance across several pages in the app, and different business logic may be attached to it through props or slots.

#### Entity relationships[​](#entity-relationships "Direct link to heading")

Entities in FSD are slices, and by default, slices cannot know about each other. In real life, however, entities often interact with each other, and sometimes one entity owns or contains other entities. Because of that, the business logic of these interactions is preferably kept in higher layers, like Features or Pages.

When one entity's data object contains other data objects, usually it's a good idea to make the connection between the entities explicit and side-step the slice isolation by making a cross-reference API with the `@x` notation. The reason is that connected entities need to be refactored together, so it's best to make the connection impossible to miss.

For example:

entities/artist/model/artist.ts

```
import type { Song } from "entities/song/@x/artist";

export interface Artist {
  name: string;
  songs: Array<Song>;
}
```

entities/song/@x/artist.ts

```
export type { Song } from "../model/song.ts";
```

Learn more about the `@x` notation in the [Public API for cross-imports](/docs/reference/public-api.md#public-api-for-cross-imports) section.

### Features[​](#features "Direct link to heading")

This layer is for the main interactions in your app, things that your users care to do. These interactions often involve business entities, because that's what the app is about.

A crucial principle for using the Features layer effectively is: **not everything needs to be a feature**. A good indicator that something needs to be a feature is the fact that it is reused on several pages.

For example, if the app has several editors, and all of them have comments, then comments are a reused feature. Remember that slices are a mechanism for finding code quickly, and if there are too many features, the important ones are drowned out.

Ideally, when you arrive in a new project, you would discover its functionality by looking through the pages and features. When deciding on what should be a feature, optimize for the experience of a newcomer to the project to quickly discover large important areas of code.

A feature slice might contain the UI to perform the interaction like a form (`📁 ui`), the API calls needed to make the action (`📁 api`), validation and internal state (`📁 model`), feature flags (`📁 config`).

### Widgets[​](#widgets "Direct link to heading")

The Widgets layer is intended for large self-sufficient blocks of UI. Widgets are most useful when they are reused across multiple pages, or when the page that they belong to has multiple large independent blocks, and this is one of them.

If a block of UI makes up most of the interesting content on a page, and is never reused, it **should not be a widget**, and instead it should be placed directly inside that page.

tip

If you're using a nested routing system (like the router of [Remix](https://remix.run)), it may be helpful to use the Widgets layer in the same way as a flat routing system would use the Pages layer — to create full router blocks, complete with related data fetching, loading states, and error boundaries.

In the same way, you can store page layouts on this layer.

### Pages[​](#pages "Direct link to heading")

Pages are what makes up websites and applications (also known as screens or activities). One page usually corresponds to one slice, however, if there are several very similar pages, they can be grouped into one slice, for example, registration and login forms.

There's no limit to how much code you can place in a page slice as long as your team still finds it easy to navigate. If a UI block on a page is not reused, it's perfectly fine to keep it inside the page slice.

In a page slice you can typically find the page's UI as well as loading states and error boundaries (`📁 ui`) and the data fetching and mutating requests (`📁 api`). It's not common for a page to have a dedicated data model, and tiny bits of state can be kept in the components themselves.

### Processes[​](#processes "Direct link to heading")

caution

This layer has been deprecated. The current version of the spec recommends avoiding it and moving its contents to `features` and `app` instead.

Processes are escape hatches for multi-page interactions.

This layer is deliberately left undefined. Most applications should not use this layer, and keep router-level and server-level logic on the App layer. Consider using this layer only when the App layer grows large enough to become unmaintainable and needs unloading.

### App[​](#app "Direct link to heading")

All kinds of app-wide matters, both in the technical sense (e.g., context providers) and in the business sense (e.g., analytics).

This layer usually doesn't contain slices, as well as Shared, instead having segments directly.

Here are the segments that you can typically find in this layer:

* `📁 routes` — the router configuration
* `📁 store` — global store configuration
* `📁 styles` — global styles
* `📁 entrypoint` — the entrypoint to the application code, framework-specific


---

# Public API

A public API is a *contract* between a group of modules, like a slice, and the code that uses it. It also acts as a gate, only allowing access to certain objects, and only through that public API.

In practice, it's usually implemented as an index file with re-exports:

pages/auth/index.js

```
export { LoginPage } from "./ui/LoginPage";
export { RegisterPage } from "./ui/RegisterPage";
```

## What makes a good public API?[​](#what-makes-a-good-public-api "Direct link to heading")

A good public API makes using and integrating into other code a slice convenient and reliable. It can be achieved by setting these three goals:

1. The rest of the application must be protected from structural changes to the slice, like a refactoring
2. Significant changes in the behavior of the slice that break the previous expectations should cause changes in the public API
3. Only the necessary parts of the slice should be exposed

The last goal has some important practical implications. It may be tempting to create wildcard re-exports of everything, especially in early development of the slice, because any new objects you export from your files are also automatically exported from the slice:

Bad practice, features/comments/index.js

```
// ❌ BAD CODE BELOW, DON'T DO THIS
export * from "./ui/Comment";  // 👎 don't try this at home
export * from "./model/comments";  // 💩 this is bad practice
```

This hurts the discoverability of a slice because you can't easily tell what the interface of this slice is. Not knowing the interface means that you have to dig deep into the code of a slice to understand how to integrate it. Another problem is that you might accidentally expose the module internals, which will make refactoring difficult if someone starts depending on them.

## Public API for cross-imports[​](#public-api-for-cross-imports "Direct link to heading")

Cross-imports are a situation when one slice imports from another slice on the same layer. Usually that is prohibited by the [import rule on layers](/docs/reference/layers.md#import-rule-on-layers), but often there are legitimate reasons to cross-import. For example, business entities often reference each other in the real world, and it's best to reflect these relationships in the code instead of working around them.

For this purpose, there's a special kind of public API, also known as the `@x`-notation. If you have entities A and B, and entity B needs to import from entity A, then entity A can declare a separate public API just for entity B.

* `📂 entities`

  * `📂 A`

    * `📂 @x`
      * `📄 B.ts` — a special public API just for code inside `entities/B/`
    * `📄 index.ts` — the regular public API

Then the code inside `entities/B/` can import from `entities/A/@x/B`:

```
import type { EntityA } from "entities/A/@x/B";
```

The notation `A/@x/B` is meant to be read as "A crossed with B".

note

Try to keep cross-imports to a minimum, and **only use this notation on the Entities layer**, where eliminating cross-imports is often unreasonable.

## Issues with index files[​](#issues-with-index-files "Direct link to heading")

Index files like `index.js`, also known as barrel files, are the most common way to define a public API. They are easy to make, but they are known to cause problems with certain bundlers and frameworks.

### Circular imports[​](#circular-imports "Direct link to heading")

Circular import is when two or more files import each other in a circle.

![Three files importing each other in a circle](/img/circular-import-light.svg#light-mode-only)![Three files importing each other in a circle](/img/circular-import-dark.svg#dark-mode-only)

Pictured above: three files, `fileA.js`, `fileB.js`, and `fileC.js`, importing each other in a circle.

These situations are often difficult for bundlers to deal with, and in some cases they might even lead to runtime errors that might be difficult to debug.

Circular imports can occur without index files, but having an index file presents a clear opportunity to accidentally create a circular import. It often happens when you have two objects exposed in the public API of a slice, for example, `HomePage` and `loadUserStatistics`, and the `HomePage` needs to access `loadUserStatistics`, but it does it like this:

pages/home/ui/HomePage.jsx

```
import { loadUserStatistics } from "../"; // importing from pages/home/index.js

export function HomePage() { /* … */ }
```

pages/home/index.js

```
export { HomePage } from "./ui/HomePage";
export { loadUserStatistics } from "./api/loadUserStatistics";
```

This situation creates a circular import, because `index.js` imports `ui/HomePage.jsx`, but `ui/HomePage.jsx` imports `index.js`.

To prevent this issue, consider these two principles. If you have two files, and one imports from the other:

* When they are in the same slice, always use *relative* imports and write the full import path
* When they are in different slices, always use *absolute* imports, for example, with an alias

### Large bundles and broken tree-shaking in Shared[​](#large-bundles "Direct link to heading")

Some bundlers might have a hard time tree-shaking (removing code that isn't imported) when you have an index file that re-exports everything.

Usually this isn't a problem for public APIs, because the contents of a module are usually quite closely related, so you would rarely need to import one thing and tree-shake away the other. However, there are two very common cases when the normal rules of public API in FSD may lead to issues — `shared/ui` and `shared/lib`.

These two folders are both collections of unrelated things that often aren't all needed in one place. For example, `shared/ui` might have modules for every component in the UI library:

* `📂 shared/ui/`

  * `📁 button`
  * `📁 text-field`
  * `📁 carousel`
  * `📁 accordion`

This problem is made worse when one of these modules has a heavy dependency, like a syntax highlighter or a drag'n'drop library. You don't want to pull those into every page that uses something from `shared/ui`, for example, a button.

If your bundles grow undesirably due to a single public API in `shared/ui` or `shared/lib`, it's recommended to instead have a separate index file for each component or library:

* `📂 shared/ui/`

  * `📂 button`
    * `📄 index.js`
  * `📂 text-field`
    * `📄 index.js`

Then the consumers of these components can import them directly like this:

pages/sign-in/ui/SignInPage.jsx

```
import { Button } from '@/shared/ui/button';
import { TextField } from '@/shared/ui/text-field';
```

### No real protection against side-stepping the public API[​](#no-real-protection-against-side-stepping-the-public-api "Direct link to heading")

When you create an index file for a slice, you don't actually forbid anyone from not using it and importing directly. This is especially a problem for auto-imports, because there are several places from which an object can be imported, so the IDE has to decide that for you. Sometimes it might choose to import directly, breaking the public API rule on slices.

To catch these issues automatically, we recommend using [Steiger](https://github.com/feature-sliced/steiger), an architectural linter with a ruleset for Feature-Sliced Design.

### Worse performance of bundlers on large projects[​](#worse-performance-of-bundlers-on-large-projects "Direct link to heading")

Having a large amount of index files in a project can slow down the development server, as noted by TkDodo in [his article "Please Stop Using Barrel Files"](https://tkdodo.eu/blog/please-stop-using-barrel-files).

There are several things you can do to tackle this issue:

1. The same advice as in ["Large bundles and broken tree-shaking in Shared" issue](#large-bundles) — have separate index files for each component/library in `shared/ui` and `shared/lib` instead of one big one

2. Avoid having index files in segments on layers that have slices.<br /><!-- -->For example, if you have an index for the feature "comments", `📄 features/comments/index.js`, there's no reason to have another index for the `ui` segment of that feature, `📄 features/comments/ui/index.js`.

3. If you have a very big project, there's a good chance that your application can be split into several big chunks.<br /><!-- -->For example, Google Docs has very different responsibilities for the document editor and for the file browser. You can create a monorepo setup where each package is a separate FSD root, with its own set of layers. Some packages can only have the Shared and Entities layers, others might only have Pages and App, others still might include their own small Shared, but still use the big one from another package too.


---

# Slices and segments

## Slices[​](#slices "Direct link to heading")

Slices are the second level in the organizational hierarchy of Feature-Sliced Design. Their main purpose is to group code by its meaning for the product, business, or just the application.

The names of slices are not standardized because they are directly determined by the business domain of your application. For example, a photo gallery might have slices `photo`, `effects`, `gallery-page`. A social network would require different slices, for example, `post`, `comments`, `news-feed`.

The layers Shared and App don't contain slices. That is because Shared should contain no business logic at all, hence has no meaning for the product, and App should contain only code that concerns the entire application, so no splitting is necessary.

### Zero coupling and high cohesion[​](#zero-coupling-high-cohesion "Direct link to heading")

Slices are meant to be independent and highly cohesive groups of code files. The graphic below might help to visualize the tricky concepts of *cohesion* and *coupling*:

![](/img/coupling-cohesion-light.svg#light-mode-only)![](/img/coupling-cohesion-dark.svg#dark-mode-only)

Image inspired by <https://enterprisecraftsmanship.com/posts/cohesion-coupling-difference/>

An ideal slice is independent from other slices on its layer (zero coupling) and contains most of the code related to its primary goal (high cohesion).

The independence of slices is enforced by the [import rule on layers](/docs/reference/layers.md#import-rule-on-layers):

> *A module (file) in a slice can only import other slices when they are located on layers strictly below.*

### Public API rule on slices[​](#public-api-rule-on-slices "Direct link to heading")

Inside a slice, the code could be organized in any way that you want. That doesn't pose any issues as long as the slice provides a good public API for other slices to use it. This is enforced with the **public API rule on slices**:

> *Every slice (and segment on layers that don't have slices) must contain a public API definition.*
>
> *Modules outside of this slice/segment can only reference the public API, not the internal file structure of the slice/segment.*

Read more about the rationale of public APIs and the best practices on creating one in the [Public API reference](/docs/reference/public-api.md).

### Slice groups[​](#slice-groups "Direct link to heading")

Closely related slices can be structurally grouped in a folder, but they should exercise the same isolation rules as other slices — there should be **no code sharing** in that folder.

![Features \&quot;compose\&quot;, \&quot;like\&quot; and \&quot;delete\&quot; grouped in a folder \&quot;post\&quot;. In that folder there is also a file \&quot;some-shared-code.ts\&quot; that is crossed out to imply that it\&#39;s not allowed.](/assets/images/graphic-nested-slices-b9c44e6cc55ecdbf3e50bf40a61e5a27.svg)

## Segments[​](#segments "Direct link to heading")

Segments are the third and final level in the organizational hierarchy, and their purpose is to group code by its technical nature.

There a few standardized segment names:

* `ui` — everything related to UI display: UI components, date formatters, styles, etc.
* `api` — backend interactions: request functions, data types, mappers, etc.
* `model` — the data model: schemas, interfaces, stores, and business logic.
* `lib` — library code that other modules on this slice need.
* `config` — configuration files and feature flags.

See the [Layers page](/docs/reference/layers.md#layer-definitions) for examples of what each of these segments might be used for on different layers.

You can also create custom segments. The most common places for custom segments are the App layer and the Shared layer, where slices don't make sense.

Make sure that the name of these segments describes the purpose of the content, not its essence. For example, `components`, `hooks`, and `types` are bad segment names because they aren't that helpful when you're looking for code.


---



