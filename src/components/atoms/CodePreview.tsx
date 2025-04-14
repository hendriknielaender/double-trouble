import type { ReactNode } from "react";

/**
 * This component can toggle between the code children and the given previewCode.
 *
 * The html could also be pasted into the markdown directly, but then certain tailwind
 * styles are not available to style this preview toggle.
 *
 * Limitation of this Component is that the previewCode has limited styling capability,
 * as it is set as a dangerouslyInnerHTML. Ideally this would be possible via mdx in
 * order to lift this limitation, but I couldn't figure this one so far.
 */
export function CodePreview({
  children,
  previewCode,
}: {
  children: ReactNode;
  // the preview code is generally more styled than the regular code. also it is not rendered
  // as a codeblock by the markdown renderer, so we actually need the raw string.
  previewCode: string;
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
      <div x-show="visible" className="-mt-6">
        {children}
      </div>
      <div
        x-show="!visible"
        className="flex p-1 items-center justify-center rounded-lg border-[1px] border-slate-600"
        dangerouslySetInnerHTML={{ __html: previewCode }}
      ></div>
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
