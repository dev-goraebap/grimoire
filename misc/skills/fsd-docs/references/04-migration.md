---
section: "Migration: v2.0 to v2.1 (pages-first), v1 to v2, Custom to FSD"
source: https://feature-sliced.design/llms-full.txt
copyright: "(c) 2018-2025 Feature-Sliced Design"
license: MIT
fetched_at: 2026-04-18
---

> Extracted from Feature-Sliced Design documentation (c) 2018-2025. MIT License.
> Full source: https://github.com/feature-sliced/documentation

# Migration from v2.0 to v2.1

The main change in v2.1 is the new mental model for decomposing an interface — pages first.

In v2.0, FSD would recommend identifying entities and features in your interface, considering even the smallest bits of entity representation and interactivity for decomposition. Then you would build widgets and pages from entities and features. In this model of decomposition, most of the logic was in entities and features, and pages were just compositional layers that didn't have much significance on their own.

In v2.1, we recommend starting with pages, and possibly even stopping there. Most people already know how to separate the app into individual pages, and pages are also a common starting point when trying to locate a component in the codebase. In this new model of decomposition, you keep most of the UI and logic in each individual page, maintaining a reusable foundation in Shared. If a need arises to reuse business logic across several pages, you can move it to a layer below.

Another addition to Feature-Sliced Design is the standardization of cross-imports between entities with the `@x`-notation.

## How to migrate[​](#how-to-migrate "Direct link to heading")

There are no breaking changes in v2.1, which means that a project written with FSD v2.0 is also a valid project in FSD v2.1. However, we believe that the new mental model is more beneficial for teams and especially onboarding new developers, so we recommend making minor adjustments to your decomposition.

### Merge slices[​](#merge-slices "Direct link to heading")

A simple way to start is by running our linter, [Steiger](https://github.com/feature-sliced/steiger), on the project. Steiger is built with the new mental model, and the most helpful rules will be:

* [`insignificant-slice`](https://github.com/feature-sliced/steiger/tree/master/packages/steiger-plugin-fsd/src/insignificant-slice) — if an entity or feature is only used in one page, this rule will suggest merging that entity or feature into the page entirely.
* [`excessive-slicing`](https://github.com/feature-sliced/steiger/tree/master/packages/steiger-plugin-fsd/src/excessive-slicing) — if a layer has too many slices, it's usually a sign that the decomposition is too fine-grained. This rule will suggest merging or grouping some slices to help project navigation.

```
npx steiger src
```

This will help you identify which slices are only used once, so that you could reconsider if they are really necessary. In such considerations, keep in mind that a layer forms some kind of global namespace for all the slices inside of it. Just as you wouldn't pollute the global namespace with variables that are only used once, you should treat a place in the namespace of a layer as valuable, to be used sparingly.

### Standardize cross-imports[​](#standardize-cross-imports "Direct link to heading")

If you had cross-imports between in your project before (we don't judge!), you may now take advantage of a new notation for cross-importing in Feature-Sliced Design — the `@x`-notation. It looks like this:

entities/B/some/file.ts

```
import type { EntityA } from "entities/A/@x/B";
```

For more details, check out the [Public API for cross-imports](/docs/reference/public-api.md#public-api-for-cross-imports) section in the reference.


---



# Migration from v1 to v2

## Why v2?[​](#why-v2 "Direct link to heading")

The original concept of **feature-slices** [was announced](https://t.me/feature_slices) in 2018.

Since then, many transformations of the methodology have taken place, but at the same time **[the basic principles were preserved](https://feature-sliced.design/featureslices.dev/v1.0.html)**:

* Using a *standardized* frontend project structure
* Splitting the application in the first place-according to *business logic*
* Use of *isolated features* to prevent implicit side effects and cyclic dependencies
* Using the *Public API* with a ban on climbing "into the insides" of the module

At the same time, in the previous version of the methodology, there were still **weak points** that

* Sometimes it leads to boilerplate code
* Sometimes it leads to excessive complication of the code base and non-obvious rules between abstractions
* Sometimes it leads to implicit architectural solutions, which prevented the project from being pulled up and new people from onboarding

The new version of the methodology ([v2](https://github.com/feature-sliced/documentation)) is designed **to eliminate these shortcomings, while preserving the existing advantages** of the approach.

Since 2018, [has also developed](https://github.com/kof/feature-driven-architecture/issues) another similar methodology - [**feature-driven**](https://github.com/feature-sliced/documentation/tree/rc/feature-driven), which was first announced by [Oleg Isonen](https://github.com/kof).

After merging of the two approaches, we have **improved and refined existing practices** - towards greater flexibility, clarity and efficiency in application.

> As a result, this has even affected the name of the methodology - *"feature-slice**d**"*

## Why does it make sense to migrate the project to v2?[​](#why-does-it-make-sense-to-migrate-the-project-to-v2 "Direct link to heading")

> `WIP:` The current version of the methodology is under development and some details *may change*

#### 🔍 More transparent and simple architecture[​](#-more-transparent-and-simple-architecture "Direct link to heading")

The methodology (v2) offers **more intuitive and more common abstractions and ways of separating logic among developers.**

All this has an extremely positive effect on attracting new people, as well as studying the current state of the project, and distributing the business logic of the application.

#### 📦 More flexible and honest modularity[​](#-more-flexible-and-honest-modularity "Direct link to heading")

The methodology (v2) allows **to distribute logic in a more flexible way:**

* With the ability to refactor isolated parts from scratch
* With the ability to rely on the same abstractions, but without unnecessary interweaving of dependencies
* With simpler requirements for the location of the new module *(layer => slice => segment)*

#### 🚀 More specifications, plans, community[​](#-more-specifications-plans-community "Direct link to heading")

At the moment, the `core-team` is actively working on the latest (v2) version of the methodology

So it is for her:

* there will be more described cases / problems
* there will be more guides on the application
* there will be more real examples
* in general, there will be more documentation for onboarding new people and studying the concepts of the methodology
* the toolkit will be developed in the future to comply with the concepts and conventions on architecture

> Of course, there will be user support for the first version as well - but the latest version is still a priority for us
>
> In the future, with the next major updates, you will still have access to the current version (v2) of the methodology, **without risks for your teams and projects**

## Changelog[​](#changelog "Direct link to heading")

### `BREAKING` Layers[​](#breaking-layers "Direct link to heading")

Now the methodology assumes explicit allocation of layers at the top level

* `/app` > `/processes` > **`/pages`** > **`/features`** > `/entities` > `/shared`

* *That is, not everything is now treated as features/pages*

* This approach allows you to [explicitly set rules for layers](https://t.me/atomicdesign/18708):

* The **higher the layer** of the module is located , the more **context** it has

  *(in other words-each module of the layer - can import only the modules of the underlying layers, but not higher)*

* The **lower the layer of the** module is located , the more **danger and responsibility** to make changes to it

  *(because it is usually the underlying layers that are more overused)*

### `BREAKING` Shared[​](#breaking-shared "Direct link to heading")

The infrastructure abstractions `/ui`, `/lib`, `/api`, which used to lie in the src root of the project, are now separated by a separate directory `/src/shared`

* `shared/ui` - Still the same general uikit of the application (optional)
  <!-- -->
  * *At the same time, no one forbids using `Atomic Design` here as before*
* `shared/lib` - A set of auxiliary libraries for implementing logic
  <!-- -->
  * *Still - without a dump of helpers*
* `shared/api` - A common entry point for accessing the API
  <!-- -->
  * *Can also be registered locally in each feature / page - but it is not recommended*
* As before - there should be no explicit binding to business logic in `shared`
  * *If necessary, you need to take this relationship to the `entities` level or even higher*

### `NEW` Entities, Processes[​](#new-entities-processes "Direct link to heading")

In v2 **, other new abstractions** have been added to eliminate the problems of logic complexity and high coupling.

* `/entities` - layer **business entities** containing slices that are related directly to the business models or synthetic entities required only on frontend
  <!-- -->
  * *Examples: `user`, `i18n`, `order`, `blog`*

* `/processes` - layer **business processes**, penetrating app

  <!-- -->

  * **The layer is optional**, it is usually recommended to use it when *the logic grows and begins to blur in several pages*
  * *Examples: `payment`, `auth`, `quick-tour`*

### `BREAKING` Abstractions & Naming[​](#breaking-abstractions--naming "Direct link to heading")

Now specific abstractions and [clear recommendations for naming them](/docs/about/understanding/naming.md)are defined

#### Layers[​](#layers "Direct link to heading")

* `/app` — **application initialization layer**
  * *Previous versions: `app`, `core`,`init`, `src/index` (and this happens)*
* `/processes` — [**business process layer**](https://github.com/feature-sliced/documentation/discussions/20)
  * *Previous versions: `processes`, `flows`, `workflows`*
* `/pages` — **application page layer**
  * *Previous versions: `pages`, `screens`, `views`, `layouts`, `components`, `containers`*
* `/features` — [**functionality parts layer**](https://github.com/feature-sliced/documentation/discussions/23)
  * *Previous versions: `features`, `components`, `containers`*
* `/entities` — [**business entity layer**](https://github.com/feature-sliced/documentation/discussions/18#discussioncomment-422649)
  * *Previous versions: `entities`, `models`, `shared`*
* `/shared` — [**layer of reused infrastructure code**](https://github.com/feature-sliced/documentation/discussions/31#discussioncomment-453020) 🔥
  <!-- -->
  * *Previous versions: `shared`, `common`, `lib`*

#### Segments[​](#segments "Direct link to heading")

* `/ui` — [**UI segment**](https://github.com/feature-sliced/documentation/discussions/31#discussioncomment-453132) 🔥
  <!-- -->
  * *Previous versions: `ui`, `components`, `view`*
* `/model` — [**BL-segment**](https://github.com/feature-sliced/documentation/discussions/31#discussioncomment-472645) 🔥
  <!-- -->
  * *Previous versions: `model`, `store`, `state`, `services`, `controller`*
* `/lib` — segment **of auxiliary code**
  * *Previous versions: `lib`, `libs`, `utils`, `helpers`*
* `/api` — [**API segment**](https://github.com/feature-sliced/documentation/discussions/66)
  * *Previous versions: `api`, `service`, `requests`, `queries`*
* `/config` — **application configuration segment**
  * *Previous versions: `config`, `env`, `get-env`*

### `REFINED` Low coupling[​](#refined-low-coupling "Direct link to heading")

Now it is much easier to [observe the principle of low coupling](/docs/reference/slices-segments.md#zero-coupling-high-cohesion) between modules, thanks to the new layers.

*At the same time, it is still recommended to avoid as much as possible cases where it is extremely difficult to "uncouple" modules*

## See also[​](#see-also "Direct link to heading")

* [Notes from the report "React SPB Meetup #1"](https://t.me/feature_slices)
* [React Berlin Talk - Oleg Isonen "Feature Driven Architecture"](https://www.youtube.com/watch?v=BWAeYuWFHhs)
* [Comparison with v1 (community-chat)](https://t.me/feature_sliced/493)
* [New ideas v2 with explanations (atomicdesign-chat)](https://t.me/atomicdesign/18708)
* [Discussion of abstractions and naming for the new version of the methodology (v2)](https://github.com/feature-sliced/documentation/discussions/31)


---



# Migration from a custom architecture

This guide describes an approach that might be helpful when migrating from a custom self-made architecture to Feature-Sliced Design.

Here is the folder structure of a typical custom architecture. We will be using it as an example in this guide.<br /><!-- -->Click on the blue arrow to open the folder.

📁 src

* 📁 actions

  * 📁 product
  * 📁 order

* 📁 api

* 📁 components

* 📁 containers

* 📁 constants

* 📁 i18n

* 📁 modules

* 📁 helpers

* 📁 routes

  * 📁 products.jsx
  * 📄 products.\[id].jsx

* 📁 utils

* 📁 reducers

* 📁 selectors

* 📁 styles

* 📄 App.jsx

* 📄 index.js

## Before you start[​](#before-you-start "Direct link to heading")

The most important question to ask your team when considering to switch to Feature-Sliced Design is — *do you really need it?* We love Feature-Sliced Design, but even we recognize that some projects are perfectly fine without it.

Here are some reasons to consider making the switch:

1. New team members are complaining that it's hard to get to a productive level
2. Making modifications to one part of the code **often** causes another unrelated part to break
3. Adding new functionality is difficult due to the sheer amount of things you need to think about

**Avoid switching to FSD against the will of your teammates**, even if you are the lead.<br /><!-- -->First, convince your teammates that the benefits outweigh the cost of migration and the cost of learning a new architecture instead of the established one.

Also keep in mind that any kind of architectural changes are not immediately observable to the management. Make sure they are on board with the switch before starting and explain to them why it might benefit the project.

tip

If you need help convincing the project manager that FSD is beneficial, consider some of these points:

1. Migration to FSD can happen incrementally, so it will not halt the development of new features
2. A good architecture can significantly decrease the time that a new developer needs to get productive
3. FSD is a documented architecture, so the team doesn't have to continuously spend time on maintaining their own documentation

***

If you made the decision to start migrating, then the first thing you want to do is to set up an alias for `📁 src`. It will be helpful later to refer to top-level folders. We will consider `@` as an alias for `./src` for the rest of this guide.

## Step 1. Divide the code by pages[​](#divide-code-by-pages "Direct link to heading")

Most custom architectures already have a division by pages, however small or large in logic. If you already have `📁 pages`, you may skip this step.

If you only have `📁 routes`, create `📁 pages` and try to move as much component code from `📁 routes` as possible. Ideally, you would have a tiny route and a larger page. As you're moving code, create a folder for each page and add an index file:

note

For now, it's okay if your pages reference each other. You can tackle that later, but for now, focus on establishing a prominent division by pages.

Route file:

src/routes/products.\[id].js

```
export { ProductPage as default } from "@/pages/product"
```

Page index file:

src/pages/product/index.js

```
export { ProductPage } from "./ProductPage.jsx"
```

Page component file:

src/pages/product/ProductPage.jsx

```
export function ProductPage(props) {
  return <div />;
}
```

## Step 2. Separate everything else from the pages[​](#separate-everything-else-from-pages "Direct link to heading")

Create a folder `📁 src/shared` and move everything that doesn't import from `📁 pages` or `📁 routes` there. Create a folder `📁 src/app` and move everything that does import the pages or routes there, including the routes themselves.

Remember that the Shared layer doesn't have slices, so it's fine if segments import from each other.

You should end up with a file structure like this:

📁 src

* 📁 app

  * 📁 routes

    * 📄 products.jsx
    * 📄 products.\[id].jsx

  * 📄 App.jsx

  * 📄 index.js

* 📁 pages

  * 📁 product

    * 📁 ui

      * 📄 ProductPage.jsx

    * 📄 index.js

  * 📁 catalog

* 📁 shared

  * 📁 actions
  * 📁 api
  * 📁 components
  * 📁 containers
  * 📁 constants
  * 📁 i18n
  * 📁 modules
  * 📁 helpers
  * 📁 utils
  * 📁 reducers
  * 📁 selectors
  * 📁 styles

## Step 3. Tackle cross-imports between pages[​](#tackle-cross-imports-between-pages "Direct link to heading")

Find all instances where one page is importing from the other and do one of the two things:

1. Copy-paste the imported code into the depending page to remove the dependency

2. Move the code to a proper segment in Shared:

   <!-- -->

   * if it's a part of the UI kit, move it to `📁 shared/ui`;
   * if it's a configuration constant, move it to `📁 shared/config`;
   * if it's a backend interaction, move it to `📁 shared/api`.

note

**Copy-pasting isn't architecturally wrong**, in fact, sometimes it may be more correct to duplicate than to abstract into a new reusable module. The reason is that sometimes the shared parts of pages start drifting apart, and you don't want dependencies getting in your way in these cases.

However, there is still sense in the DRY ("don't repeat yourself") principle, so make sure you're not copy-pasting business logic. Otherwise you will need to remember to fix bugs in several places at once.

## Step 4. Unpack the Shared layer[​](#unpack-shared-layer "Direct link to heading")

You might have a lot of stuff in the Shared layer on this step, and you generally want to avoid that. The reason is that the Shared layer may be a dependency for any other layer in your codebase, so making changes to that code is automatically more prone to unintended consequences.

Find all the objects that are only used on one page and move it to the slice of that page. And yes, *that applies to actions, reducers, and selectors, too*. There is no benefit in grouping all actions together, but there is benefit in colocating relevant actions close to their usage.

You should end up with a file structure like this:

📁 src

* 📁 app (unchanged)

* 📁 pages

  * 📁 product

    * 📁 actions

    * 📁 reducers

    * 📁 selectors

    * 📁 ui

      * 📄 Component.jsx
      * 📄 Container.jsx
      * 📄 ProductPage.jsx

    * 📄 index.js

  * 📁 catalog

* 📁 shared (only objects that are reused)

  * 📁 actions
  * 📁 api
  * 📁 components
  * 📁 containers
  * 📁 constants
  * 📁 i18n
  * 📁 modules
  * 📁 helpers
  * 📁 utils
  * 📁 reducers
  * 📁 selectors
  * 📁 styles

## Step 5. Organize code by technical purpose[​](#organize-by-technical-purpose "Direct link to heading")

In FSD, division by technical purpose is done with *segments*. There are a few common ones:

* `ui` — everything related to UI display: UI components, date formatters, styles, etc.
* `api` — backend interactions: request functions, data types, mappers, etc.
* `model` — the data model: schemas, interfaces, stores, and business logic.
* `lib` — library code that other modules on this slice need.
* `config` — configuration files and feature flags.

You can create your own segments, too, if you need. Make sure not to create segments that group code by what it is, like `components`, `actions`, `types`, `utils`. Instead, group the code by what it's for.

Reorganize your pages to separate code by segments. You should already have a `ui` segment, now it's time to create other segments, like `model` for your actions, reducers, and selectors, or `api` for your thunks and mutations.

Also reorganize the Shared layer to remove these folders:

* `📁 components`, `📁 containers` — most of it should become `📁 shared/ui`;
* `📁 helpers`, `📁 utils` — if there are some reused helpers left, group them together by function, like dates or type conversions, and move theses groups to `📁 shared/lib`;
* `📁 constants` — again, group by function and move to `📁 shared/config`.

## Optional steps[​](#optional-steps "Direct link to heading")

### Step 6. Form entities/features from Redux slices that are used on several pages[​](#form-entities-features-from-redux "Direct link to heading")

Usually, these reused Redux slices will describe something relevant to the business, for example, products or users, so these can be moved to the Entities layer, one entity per one folder. If the Redux slice is related to an action that your users want to do in your app, like comments, then you can move it to the Features layer.

Entities and features are meant to be independent from each other. If your business domain contains inherent connections between entities, refer to the [guide on business entities](/docs/guides/examples/types.md#business-entities-and-their-cross-references) for advice on how to organize these connections.

The API functions related to these slices can stay in `📁 shared/api`.

### Step 7. Refactor your modules[​](#refactor-your-modules "Direct link to heading")

The `📁 modules` folder is commonly used for business logic, so it's already pretty similar in nature to the Features layer from FSD. Some modules might also be describe large chunks of the UI, like an app header. In that case, you should migrate them to the Widgets layer.

### Step 8. Form a clean UI foundation in `shared/ui`[​](#form-clean-ui-foundation "Direct link to heading")

`📁 shared/ui` should ideally contain a set of UI elements that don't have any business logic encoded in them. They should also be highly reusable.

Refactor the UI components that used to be in `📁 components` and `📁 containers` to separate out the business logic. Move that business logic to the higher layers. If it's not used in too many places, you could even consider copy-pasting.

## See also[​](#see-also "Direct link to heading")

* [(Talk in Russian) Ilya Klimov — Крысиные бега бесконечного рефакторинга: как не дать техническому долгу убить мотивацию и продукт](https://youtu.be/aOiJ3k2UvO4)


---



