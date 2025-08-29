"use client";
import React, { useCallback, useMemo, useRef } from "react";
import { createEditor, Descendant } from "slate";
import { Editable, Slate } from "slate-react";
import RenderLeafs from "./render-leaf";
import RenderElement from "./render-elements";
import { onKeyDown } from "./utils/keydown";
import { EditorPlugins } from "./plugins/editor-plugins";
import FixedToolBar from "./Toolbar/Fixed";
import dynamic from "next/dynamic";
import LinkPopover from "./Toolbar/LinkPopover";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { toastOptions } from "@/lib/constant";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import useEditorStore from "@/store/editorStore";
import { detectCommandMenu } from "./utils/detectCommandMenu";
import { apiClient } from "@/lib/apiClient";

const CommandMenu = dynamic(
  () => import("@/components/Editor/Toolbar/CommandMenu"),
  { ssr: false },
);

const FloatingToolBar = dynamic(
  () => import("@/components/Editor/Toolbar/Floating"),
  { ssr: false },
);

interface ArticleContent {
  id: string;
  articleId: string;
  content: Descendant[] | null;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  article?: ArticleContent;
}

const defaultValue: Descendant[] = [
  {
    id: "1",
    type: "p",
    children: [{ text: "We are happy." }],
  },
];

export default function Editor({ article }: Props) {
  const editor = useMemo(() => EditorPlugins(createEditor()), []);
  const initialValue = useMemo(() => article?.content || defaultValue, []);
  const { iscommandMenuOpen, setCommandMenu, setPosition, position } =
    useEditorStore();
  const { data: session } = useSession();
  const token = session?.user.accessToken as string;
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const websiteId = searchParams.get("websiteId");

  const abortControllerRef = useRef<AbortController>(null);

  const saveContent = useCallback(
    useDebouncedCallback(async (value) => {
      if (!token || !params.id) return;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const newController = new AbortController();
      abortControllerRef.current = newController;
      const url = pathname.startsWith("/dashboard/articles")
        ? `/api/articles/content`
        : `/api/website-article/website/${websiteId}/content`;
      const { error } = await apiClient.put(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          articleId: params.id,
          content: value,
        }),
        signal: newController.signal,
      });
      if (error) {
        toast.error(error, toastOptions);
      }
    }, 1000),
    [],
  );

  return (
    <Slate
      editor={editor}
      onChange={(value) => {
        detectCommandMenu(editor, {
          position,
          setCommandMenu,
          iscommandMenuOpen,
          setPosition,
        });
        const isAstChange = editor.operations.some(
          (op) => "set_selection" !== op.type,
        );
        if (isAstChange) {
          saveContent(value);
        }
      }}
      initialValue={initialValue}
    >
      <FixedToolBar />
      {iscommandMenuOpen && <CommandMenu />}
      {editor.selection && <FloatingToolBar />}
      <LinkPopover />
      <Editable
        className="my-2 mx-5 px-2 md:px-10 outline-none"
        autoFocus
        renderLeaf={RenderLeafs}
        spellCheck={false}
        renderElement={RenderElement}
        onKeyDown={(event) => onKeyDown(event, editor)}
      />
    </Slate>
  );
}
