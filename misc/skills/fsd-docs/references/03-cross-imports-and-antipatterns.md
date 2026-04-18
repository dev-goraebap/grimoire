---
section: "Cross-imports, Desegmentation, Excessive Entities, Routing"
source: https://feature-sliced.design/llms-full.txt
copyright: "(c) 2018-2025 Feature-Sliced Design"
license: MIT
fetched_at: 2026-04-18
---

> Extracted from Feature-Sliced Design documentation (c) 2018-2025. MIT License.
> Full source: https://github.com/feature-sliced/documentation

# Cross-import

A **cross-import** is an import **between different slices within the same layer**.

For example:

* importing `features/product` from `features/cart`
* importing `widgets/sidebar` from `widgets/header`

Cross-imports are a code smell: a warning sign that slices are becoming coupled. In some situations they may be hard to avoid, but they should always be deliberate and either documented or shared within the team/project.

note

The `shared` and `app` layers do not have the concept of a slice, so imports *within* those layers are **not** considered cross-imports.

## Why is this a code smell?[​](#why-is-this-a-code-smell "Direct link to heading")

Cross-imports are not just a matter of style—they are generally considered a **code smell** because they blur the boundaries between domains and introduce implicit dependencies.

Consider a case where the `cart` slice directly depends on `product` business logic. At first glance, this might seem convenient. However, this creates several problems:

1. **Unclear ownership and responsibility.** When `cart` imports from `product`, it becomes unclear which slice "owns" the shared logic. If the `product` team changes their internal implementation, they might unknowingly break `cart`. This ambiguity makes it harder to reason about the codebase and assign responsibility for bugs or features.

2. **Reduced isolation and testability.** One of the main benefits of sliced architecture is that each slice can be developed, tested, and deployed independently. Cross-imports break this isolation—testing `cart` now requires setting up `product` as well, and changes in one slice can cause unexpected test failures in another.

3. **Increased cognitive load.** Working on `cart` also requires accounting for how `product` is structured and how it behaves. As cross-imports accumulate, tracing the impact of a change requires following more code across slice boundaries, and even small edits demand more context to be held in mind.

4. **Path to circular dependencies.** Cross-imports often start as one-way dependencies but can evolve into bidirectional ones (A imports B, B imports A). This tends to lock slices together, making dependencies harder to untangle and increasing refactoring cost over time.

The purpose of clear domain boundaries is to keep each slice focused and changeable within its own responsibility. When dependencies are loose, it becomes easier to predict the impact of a change and to keep review and testing scope contained. Cross-imports weaken this separation, expanding the impact of changes and increasing refactoring cost over time—this is why they are treated as a code smell worth addressing.

In the sections below, we outline how these issues typically appear in real projects and what strategies you can use to address them.

## Entities layer cross-imports[​](#entities-layer-cross-imports "Direct link to heading")

Cross-imports in `entities` are often caused by splitting entities too granularly. Before reaching for `@x`, consider whether the boundaries should be merged instead. Some teams use `@x` as a dedicated cross-import surface for `entities`, but it should be treated as a **last resort** — a **necessary compromise**, not a recommended approach.

Think of `@x` as an explicit gateway for unavoidable domain references—not a general-purpose reuse mechanism. Overuse tends to lock entity boundaries together and makes refactoring more costly over time.

For details about `@x`, see the [Public API documentation](/docs/reference/public-api.md).

For concrete examples of cross-references between business entities, see:

* [Types guide — Business entities and their cross-references](/docs/guides/examples/types.md#business-entities-and-their-cross-references)
* [Layers reference — Entities](/docs/reference/layers.md#entities)

## Features and widgets: Multiple strategies[​](#features-and-widgets-multiple-strategies "Direct link to heading")

In the `features` and `widgets` layers, it's usually more realistic to say there are **multiple strategies** for handling cross-imports, rather than declaring them **always forbidden**. This section focuses less on code and more on the **patterns** you can choose from depending on your team and product context.

### Strategy A: Slice merge[​](#strategy-a-slice-merge "Direct link to heading")

If two slices are not truly independent and they are always changed together, merge them into a single larger slice.

Example (before):

* `features/profile`
* `features/profileSettings`

If these keep cross-importing each other and effectively move as one unit, they are likely one feature in practice. In that case, merging into `features/profile` is often the simpler and cleaner choice.

### Strategy B: Push shared domain flows down into `entities` (domain-only)[​](#strategy-b-push-shared-domain-flows-down-into-entities-domain-only "Direct link to heading")

If multiple features share a domain-level flow, move that flow into a domain slice inside `entities` (for example, `entities/session`).

Key principles:

* `entities` contains **domain types and domain logic only**
* UI remains in `features` / `widgets`
* features import and use the domain logic from `entities`

For example, if both `features/auth` and `features/profile` need session validation, place session-related domain functions in `entities/session` and reuse them from both features.

For more guidance, see [Layers reference — Entities](/docs/reference/layers.md#entities).

### Strategy C: Compose from an upper layer (pages / app)[​](#strategy-c-compose-from-an-upper-layer-pages--app "Direct link to heading")

Instead of connecting slices within the same layer via cross-imports, compose them at a higher level (`pages` / `app`). This approach uses **Inversion of Control (IoC)** patterns—rather than slices knowing about each other, an upper layer assembles and connects them.

Common IoC techniques include:

* **Render props (React)**: Pass components or render functions as props
* **Slots (Vue)**: Use named slots to inject content from parent components
* **Dependency injection**: Pass dependencies through props or context

#### Basic composition example (React):[​](#basic-composition-example-react "Direct link to heading")

features/userProfile/index.ts

```
export { UserProfilePanel } from './ui/UserProfilePanel';
```

features/activityFeed/index.ts

```
export { ActivityFeed } from './ui/ActivityFeed';
```

pages/UserDashboardPage.tsx

```
import React from 'react';
import { UserProfilePanel } from '@/features/userProfile';
import { ActivityFeed } from '@/features/activityFeed';

export function UserDashboardPage() {
    return (
        <div>
            <UserProfilePanel />
            <ActivityFeed />
        </div>
    );
}
```

With this structure, `features/userProfile` and `features/activityFeed` do not know about each other. `pages/UserDashboardPage` composes them to build the full screen.

#### Render props example (React):[​](#render-props-example-react "Direct link to heading")

When one feature needs to render content from another, use render props to invert the dependency:

features/commentList/ui/CommentList.tsx

```
interface CommentListProps {
    comments: Comment[];
    renderUserAvatar?: (userId: string) => React.ReactNode;
}

export function CommentList({ comments, renderUserAvatar }: CommentListProps) {
    return (
        <ul>
            {comments.map(comment => (
                <li key={comment.id}>
                    {renderUserAvatar?.(comment.userId)}
                    <span>{comment.text}</span>
                </li>
            ))}
        </ul>
    );
}
```

pages/PostPage.tsx

```
import { CommentList } from '@/features/commentList';
import { UserAvatar } from '@/features/userProfile';

export function PostPage() {
    return (
        <CommentList
            comments={comments}
            renderUserAvatar={(userId) => <UserAvatar userId={userId} />}
        />
    );
}
```

Now `CommentList` doesn't import from `userProfile`—the page injects the avatar component.

#### Slots example (Vue):[​](#slots-example-vue "Direct link to heading")

Vue's slot system provides a natural way to compose features without cross-imports:

features/commentList/ui/CommentList.vue

```
<template>
    <ul>
        <li v-for="comment in comments" :key="comment.id">
            <slot name="avatar" :userId="comment.userId" />
            <span>{{ comment.text }}</span>
        </li>
    </ul>
</template>

<script setup lang="ts">
defineProps<{
    comments: Comment[];
}>();
</script>
```

pages/PostPage.vue

```
<template>
    <CommentList :comments="comments">
        <template #avatar="{ userId }">
            <UserAvatar :userId="userId" />
        </template>
    </CommentList>
</template>

<script setup lang="ts">
import { CommentList } from '@/features/commentList';
import { UserAvatar } from '@/features/userProfile';
</script>
```

The `CommentList` feature remains independent of `userProfile`. The page uses slots to compose them together.

### Strategy D: Cross-feature reuse only via Public API[​](#strategy-d-cross-feature-reuse-only-via-public-api "Direct link to heading")

If the above strategies don't fit your case and cross-feature reuse is truly unavoidable, allow it only through an explicit **Public API** (for example: exported hooks or UI components). Avoid directly accessing another slice's `store`/`model` or internal implementation details.

Unlike strategies A-C which aim to eliminate cross-imports, this strategy accepts them while minimizing the risks through strict boundaries.

#### Example code:[​](#example-code "Direct link to heading")

features/auth/index.ts

```

export { useAuth } from './model/useAuth';
export { AuthButton } from './ui/AuthButton';
```

features/profile/ui/ProfileMenu.tsx

```

import React from 'react';
import { useAuth, AuthButton } from '@/features/auth';

export function ProfileMenu() {
    const { user } = useAuth();

    if (!user) {
        return <AuthButton />;
    }

    return <div>{user.name}</div>;
}
```

For example, prevent `features/profile` from importing from paths like `features/auth/model/internal/*`. Restrict usage to only what `features/auth` explicitly exposes as its Public API.

## When should cross-imports be treated as a problem?[​](#when-should-cross-imports-be-treated-as-a-problem "Direct link to heading")

After reviewing these strategies, a natural question is:

> When is a cross-import acceptable to keep, and when should it be treated as a code smell and refactored?

Common warning signs:

* directly depending on another slice's store/model/business logic
* deep imports into another slice's internal files
* **bidirectional dependencies** (A imports B, and B imports A)
* changes in one slice frequently breaking another slice
* flows that should be composed in `pages` / `app`, but are forced into cross-imports within the same layer

When you see these signals, treat the cross-import as a **code smell** and consider applying at least one of the strategies above.

## How strict you are is a team/project decision[​](#how-strict-you-are-is-a-teamproject-decision "Direct link to heading")

How strictly to enforce these rules depends on the team and project.

For example:

* In **early-stage products** with heavy experimentation, allowing some cross-imports may be a pragmatic speed trade-off.
* In **long-lived or regulated systems** (for example, fintech or large-scale services), stricter boundaries often pay off in maintainability and stability.

Cross-imports are not an absolute prohibition here. They are dependencies that are **generally best avoided**, but sometimes used intentionally.

If you do introduce a cross-import:

* treat it as a deliberate architectural choice
* document the reasoning
* revisit it periodically as the system evolves

Teams should align on:

* what strictness level they want
* how to reflect it in lint rules, code review, and documentation
* when and how to reevaluate existing cross-imports over time

## References[​](#references "Direct link to heading")

* [(Thread) About the supposed inevitability of cross-ports](https://t.me/feature_sliced/4515)
* [(Thread) About resolving cross-ports in entities](https://t.me/feature_sliced/3678)
* [(Thread) About cross-imports and responsibility](https://t.me/feature_sliced/3287)
* [(Thread) About imports between segments](https://t.me/feature_sliced/4021)
* [(Thread) About cross-imports inside shared](https://t.me/feature_sliced/3618)


---

# Desegmentation

Desegmentation (also known as horizontal slicing or packaging by layer) is a code organization pattern where files are grouped by their technical roles rather than by the business domains they serve. This means code with similar technical functions is stored in the same place, regardless of the business logic it handles.

This approach is popular in meta-frameworks like Next and Nuxt due to its simplicity, as it's easy to get started and enables features like auto-imports and file-based routing:

* 📂 app

  <!-- -->

  * 📂 components

    <!-- -->

    * 📄 DeliveryCard.jsx
    * 📄 DeliveryChoice.jsx
    * 📄 RegionSelect.jsx
    * 📄 UserAvatar.jsx

  * 📂 actions

    <!-- -->

    * 📄 delivery.js
    * 📄 region.js
    * 📄 user.js

  * 📂 composables

    <!-- -->

    * 📄 delivery.js
    * 📄 region.js
    * 📄 user.js

  * 📂 constants

    <!-- -->

    * 📄 delivery.js
    * 📄 region.js
    * 📄 user.js

  * 📂 utils

    <!-- -->

    * 📄 delivery.js
    * 📄 region.js
    * 📄 user.js

  * 📂 stores

    <!-- -->

    * 📂 delivery

      <!-- -->

      * 📄 getters.js
      * 📄 actions.js

This pattern also occurs in FSD codebases, in the form of generic folders:

* 📂 features
  <!-- -->
  * 📂 delivery
    <!-- -->
    * 📂 ui
      <!-- -->
      * 📂 components ⚠️
* 📂 entities
  <!-- -->
  * 📂 recommendations
    <!-- -->
    * 📂 utils ⚠️

Files can also be a source of desegmentation. Files like `types.ts` can aggregate multiple domains, complicating navigation and future refactoring, especially in layers like `pages` or `widgets`:

* 📂 pages

  <!-- -->

  * 📂 delivery

    <!-- -->

    * 📄 index.ts

    * 📂 ui

      <!-- -->

      * 📄 DeliveryCard.tsx
      * 📄 DeliveryChoice.tsx
      * 📄 UserAvatar.tsx

    * 📂 model

      <!-- -->

      * 📄 types.ts ⚠️
      * 📄 utils.ts ⚠️

    * 📂 api
      <!-- -->
      * 📄 endpoints.ts ⚠️

- types.ts
- utils.ts
- endpoints.ts

pages/delivery/model/types.ts

```
// ❌ Bad: Mixed business domains in generic file
export interface DeliveryOption {
  id: string;
  name: string;
  price: number;
}

export interface UserInfo {
  id: string;
  name: string;
  avatar: string;
}
```

pages/delivery/model/utils.ts

```
// ❌ Bad: Mixed business domains in generic file
export function formatDeliveryPrice(price: number) {
  return `$${price.toFixed(2)}`;
}

export function getUserInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('');
}
```

pages/delivery/api/endpoints.ts

```
// ❌ Bad: Mixed business domains in generic file
export async function fetchDeliveryOptions() { /* ... */ }
export async function fetchUserInfo() { /* ... */ }
```

## The Problem[​](#the-problem "Direct link to heading")

While this structure is easy to start with, it can lead to scalability issues in larger projects:

* Low Cohesion: Modifying a single feature often requires editing files in multiple large folders, such as `pages`, `components`, and `stores`.

* Tight Coupling: Components can have unexpected dependencies, leading to complex and tangled dependency chains.

* Difficult Refactoring: It requires additional effort to manually extract code related to a specific domain.

## Solution[​](#solution "Direct link to heading")

Group all code that relates to a specific domain in one place.

Avoid generic folder names such as `types`, `components`, `utils`, as well as generic file names like `types.ts`, `utils.ts`, or `helpers.ts`. Instead, use names that directly reflect the domain they represent.

Avoid generic file names like `types.ts` if possible, especially in slices with multiple domains:

* 📂 pages

  <!-- -->

  * 📂 delivery

    <!-- -->

    * 📄 index.tsx

    * 📂 ui

      <!-- -->

      * 📄 DeliveryPage.tsx
      * 📄 DeliveryCard.tsx
      * 📄 DeliveryChoice.tsx
      * 📄 UserInfo.tsx

    * 📂 model

      <!-- -->

      * 📄 delivery.ts
      * 📄 user.ts

## See Also[​](#see-also "Direct link to heading")

* [(Article) About Low Coupling and High Cohesion clearly](https://enterprisecraftsmanship.com/posts/cohesion-coupling-difference/)
* [(Article) Low Coupling and High Cohesion. The Law of Demeter](https://medium.com/german-gorelkin/low-coupling-high-cohesion-d36369fb1be9)


---

# Excessive Entities

The `entities` layer in Feature-Sliced Design is one of the lower layers that's primarily for business logic. That makes it widely accessible — all layers except for `shared` can access it. However, its global nature means that changes to `entities` can have a widespread impact, requiring careful design to avoid costly refactors.

Excessive entities can lead to ambiguity (what code belongs to this layer), coupling, and constant import dilemmas (code scattered across sibling entities).

## How to keep `entities` layer clean[​](#how-to-keep-entities-layer-clean "Direct link to heading")

### 0. Consider having no `entities` layer[​](#0-consider-having-no-entities-layer "Direct link to heading")

You might think that your application won't be Feature-Sliced if you don't include this layer, but it is completely fine for the application to have no `entities` layer. It doesn't break FSD in any way, on the contrary, it simplifies the architecture and keeps the `entities` layer available for future scaling. For example, if your application acts as a thin client, most likely it doesn't need `entities` layer.

What are thick and thin clients?

*Thick* vs. *thin client* distinction refers to how the application processes data:

* *Thin* clients rely on the backend for most data processing. Client-side business logic is minimal and involves only exchanging data with the backend.
* *Thick* clients handle significant client-side business logic, making them suitable candidates for the `entities` layer.

Keep in mind that this classification is not strictly binary, and different parts of the same application may act as a "thick" or a "thin" client.

### 1. Avoid preemptive slicing[​](#1-avoid-preemptive-slicing "Direct link to heading")

In contrast to previous versions, FSD 2.1 encourages deferred decomposition of slices instead of preemptive, and this approach also extends to `entities` layer. At first, you can place all your code in the `model` segment of your page (widget, feature), and then consider refactoring it later, when business requirements are stable.

Remember: the later you move code to the `entities` layer, the less dangerous your potential refactors will be — code in Entities may affect functionality of any slice on higher layers.

### 2. Avoid Unnecessary Entities[​](#2-avoid-unnecessary-entities "Direct link to heading")

Do not create an entity for every piece of business logic. Instead, leverage types from `shared/api` and place logic in the `model` segment of a current slice. For reusable business logic, use the `model` segment within an entity slice while keeping data definitions in `shared/api`:

```
📂 entities
  📂 order
    📄 index.ts
    📂 model
      📄 apply-discount.ts // Business logic using OrderDto from shared/api
📂 shared
  📂 api
    📄 index.ts
    📂 endpoints
      📄 order.ts
```

### 3. Exclude CRUD Operations from Entities[​](#3-exclude-crud-operations-from-entities "Direct link to heading")

CRUD operations, while essential, often involve boilerplate code without significant business logic. Including them in the `entities` layer can clutter it and obscure meaningful code. Instead, place CRUD operations in `shared/api`:

```
📂 shared
  📂 api
    📄 client.ts
    📄 index.ts
    📂 endpoints
      📄 order.ts // Contains all order-related CRUD operations
      📄 products.ts
      📄 cart.ts
```

For complex CRUD operations (e.g., atomic updates, rollbacks, or transactions), evaluate whether the `entities` layer is appropriate, but use it with caution.

### 4. Store Authentication Data in `shared`[​](#4-store-authentication-data-in-shared "Direct link to heading")

Prefer `shared` layer to creating a `user` entity for authentication data, such as tokens or user DTOs returned from the backend. These are context-specific and unlikely to be reused outside authentication scope:

* Authentication responses (e.g., tokens or DTOs) often lack fields needed for broader reuse or vary by context (e.g., private vs. public user profiles).
* Using entities for auth data can lead to cross-layer imports (e.g., `entities` into `shared`) or usage of `@x` notation, complicating the architecture.

Instead, store authentication-related data in `shared/auth` or `shared/api`:

```
📂 shared
  📂 auth
    📄 use-auth.ts // authenticated user info or token
    📄 index.ts
  📂 api
    📄 client.ts
    📄 index.ts
    📂 endpoints
      📄 order.ts
```

For more details on implementing authentication, see [the Authentication guide](/docs/guides/examples/auth.md).

### 5. Minimize Cross-Imports[​](#5-minimize-cross-imports "Direct link to heading")

FSD permits cross-imports via `@x` notation, but they can introduce technical issues like circular dependencies. To avoid this, design entities within isolated business contexts to eliminate the need for cross-imports:

Non-Isolated Business Context (Avoid):

```
📂 entities
  📂 order
    📂 @x
    📂 model
  📂 order-item
    📂 @x
    📂 model
  📂 order-customer-info
    📂 @x
    📂 model
```

Isolated Business Context (Preferred):

```
📂 entities
  📂 order-info
    📄 index.ts
    📂 model
      📄 order-info.ts
```

An isolated context encapsulates all related logic (e.g., order items and customer info) within a single module, reducing complexity and preventing external modifications to tightly coupled logic.


---

# Routing

WIP

This article is in the process of being written

To bring the release of the article closer, you can:

* 📢 Share your feedback [at article (comment/emoji-reaction)](https://github.com/feature-sliced/documentation/issues/169)
* 💬 Collect the relevant [material on the topic from chat](https://t.me/feature_sliced)
* ⚒️ Contribute [in any other way](https://github.com/feature-sliced/documentation/blob/master/CONTRIBUTING.md)

<br />

*🍰 Stay tuned!*

## Situation[​](#situation "Direct link to heading")

Urls to pages are hardcoded in the layers below pages

entities/post/card

```

<Card>
    <Card.Title 
        href={`/post/${data.id}`}
        title={data.name}
    />
    ...
</Card>
```

## Problem[​](#problem "Direct link to heading")

Urls are not concentrated in the page layer, where they belong according to the scope of responsibility

## If you ignore it[​](#if-you-ignore-it "Direct link to heading")

Then, when changing urls, you will have to keep in mind that these urls (and the logic of urls/redirects) can be in all layers except pages

And it also means that now even a simple product card takes part of the responsibility from the pages, which smears the logic of the project

## Solution[​](#solution "Direct link to heading")

Determine how to work with urls/redirects from the page level and above

Transfer to the layers below via composition/props/factories

## See also[​](#see-also "Direct link to heading")

* [(Thread) What if I "sew up" routing in entities/features/widgets](https://t.me/feature_sliced/4389)
* [(Thread) Why does it smear the logic of routes only in pages](https://t.me/feature_sliced/3756)


---



