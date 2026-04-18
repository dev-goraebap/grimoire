# 사이트별 특이사항

문서 프레임워크별로 `discover.mjs`가 어떤 소스를 잡는지, 주의할 점은 무엇인지 정리.

## llms.txt / llms-full.txt 제공 사이트 (이상적)

최근 많은 문서 사이트가 LLM용 텍스트를 제공한다. 발견 순위 1~2위. 예:

- Anthropic (`https://docs.anthropic.com/llms-full.txt`)
- Vercel (`https://vercel.com/docs/llms.txt`)
- Supabase (`https://supabase.com/llms.txt`)
- Cloudflare (`https://developers.cloudflare.com/llms.txt`)
- Next.js (`https://nextjs.org/docs/llms.txt`)

있으면 사실상 `fetch` 한 방으로 끝난다. WebFetch를 돌 필요 없음.

## Docusaurus

- **예**: feature-sliced.design, reactnative.dev, redux.js.org, kubernetes.io (일부)
- `sitemap.xml`이 **거의 항상** 제공됨. 2위 폴백 `sitemap`이 잘 먹힌다.
- 페이지는 정적 HTML이라 WebFetch 친화적.
- 다국어 사이트는 `/zh/`, `/ko/` 등 모든 언어가 sitemap에 들어있다 → `pathPrefix` 필터로 입력한 언어만 남김.
- 블로그·랜딩 페이지는 `/docs/` prefix가 아니면 제외되니 입력 URL은 반드시 docs 루트를 주자.

## VitePress

- **예**: vitejs.dev, vitest.dev, vue-router 관련
- `sitemap.xml`은 빌드 설정에 따라 있을 수도 없을 수도. 없으면 nav 폴백.
- 각 페이지 상단 breadcrumb·사이드바가 HTML 고정으로 렌더되므로 nav 추출 가능.

## Nextra / Next.js docs

- **예**: nextjs.org, turbo.build, swr.vercel.app
- 대부분 `llms.txt` 또는 `llms-full.txt` 제공. 1위가 잡힌다.
- 없다면 `sitemap.xml`도 대체로 존재.

## MkDocs (Material)

- **예**: fastapi.tiangolo.com, squidfunk.github.io
- `sitemap.xml` 제공. 2위 폴백.
- 검색 인덱스 `search/search_index.json`도 유용하지만 discover.mjs는 쓰지 않는다. 필요하면 수동.

## GitBook

- `sitemap.xml`이 있긴 한데 클라우드 호스팅 특성상 `<loc>`이 동적 CDN URL일 수 있다.
- nav 폴백이 더 안정적일 때가 많다.

## Sphinx / ReadTheDocs

- **예**: docs.python.org, numpy.org, scikit-learn.org
- `sitemap.xml` 제공. 대체로 2위로 충분.
- 섹션이 매우 많으므로 입력 URL을 구체적으로 주지 않으면 MAX 페이지 제한에 바로 걸린다. `--max=50`으로 높이거나 하위 경로를 정확히 지정.

## React docs (react.dev)

- `sitemap.xml` 없음, `llms.txt` 없음.
- nav 폴백이 잘 동작 (사이드바가 HTML 링크로 렌더됨).
- 단일 페이지만 필요하면 `single` 폴백도 충분.

## Stripe / 대기업 API docs

- 대체로 JS 렌더링에 의존하지 않고 SEO를 위해 SSR. WebFetch OK.
- `sitemap.xml` 제공.

## 주의: JS 렌더링 SPA

- 구버전 Storybook 사이트, Firebase Hosting에 올린 React SPA 등은 HTML이 거의 비어있다.
- `discover.mjs`가 `single`로 폴백되고 WebFetch 결과가 빈 Markdown으로 나오면 SPA 의심 → `failure-modes.md`의 "JS 렌더링" 항목 참조.
