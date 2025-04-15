import type { ReactNode } from "react";

/**
 * This component can toggle between the code children and the given previewCode.
 *
 * HTML that is pasted directly into the markdown, or passed into this component as string
 * will not have many of the tailwind styles applied, as they are not detected by the
 * renderer.
 *
 * For this resason, both the preview and the markdown-rendered code snippet are passed as
 * children, so they all get properly tailwind-rendered. The compromise here is that part
 * of the component is passed as a children, which seemed to be the only way to have this
 * work, without creating a custom markdown renderer.
 *
 * Example usage:
 *  <CodePreview>
 *  <div x-show="visible" className="-mt-6">
 *
 *  ```html
 *  <div x-data="{ count: 0 }"></div>
 *  ```
 *  </div>
 *  <div
 *    x-show="!visible"
 *    className="flex p-1 items-center justify-center rounded-lg border-[1px] border-slate-600"
 *  >
 *    <div x-data="{ count: 0 }"></div>
 *  </div>
 *  </CodePreview>
 */
export function CodePreview({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div x-data="{ visible: true }" className="flex flex-col p-0">
      <div className="flex justify-end z-10">
        <div className="bg-slate-800  gap-2 rounded-sm p-1 flex flex-row">
          <button
            className="flex rounded-sm bg-slate-700 hover:bg-slate-500 data-[code='true']:bg-green-800 px-2"
            x-bind:data-code="visible"
            x-on:click="visible = true"
          >
            Code
          </button>
          <button
            className="flex rounded-sm bg-slate-700 hover:bg-slate-500 data-[code='true']:bg-green-800 px-2"
            x-bind:data-code="!visible"
            x-on:click="visible = false"
          >
            Preview
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}

export function CodePreviewScripts() {
  return (
    <>
      <script
        src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"
        defer
      ></script>
    </>
  );
}
