import { Editor, Transforms } from "slate";
import { jsx } from "slate-hyperscript";

export function hasOnlyOneProperty(obj: Record<string, any>): boolean {
  const keys = Object.keys(obj);
  return keys.length === 1;
}

export const ValidateList = (children: any[]) => {
  let newChildren: any[] = [];
  children.map((child: any) => {
    if ((child as Object).hasOwnProperty("type")) {
      child.children.flatMap((newChild: any) => {
        if (hasOnlyOneProperty(newChild)) {
          newChildren.push(newChild.text);
        } else {
          newChildren.push(newChild);
        }
      });
    } else {
      newChildren.push(child);
    }
  });
  return newChildren;
};

export const RemoveBreakLineCharacter = (element: any[]) => {
  const m = element.filter(
    (item) => !item.hasOwnProperty("text") && item.text !== "\n",
  );
  return m.filter((item) => !item.null || !item.undefined);
};

const ELEMENT_TAGS = {
  A: (el: HTMLElement) => ({ type: "link", href: el.getAttribute("href") }),
  BLOCKQUOTE: () => ({ type: "quote-block" }),
  H1: () => ({ type: "h1" }),
  H2: () => ({ type: "h2" }),
  H3: () => ({ type: "h3" }),
  H4: () => ({ type: "h4" }),
  H5: () => ({ type: "h5" }),
  H6: () => ({ type: "h6" }),
  IMG: (el: HTMLElement) => ({
    type: "image",
    url: el.getAttribute("src"),
  }),
  UL: () => ({ type: "ul" }),
  OL: () => ({ type: "ol" }),
  LI: () => ({ type: "li" }),
  P: () => ({ type: "p" }),
  HR: () => ({ type: "hr" }),
};

const TEXT_TAGS = {
  DEL: () => ({ strikethrough: true }),
  EM: () => ({ italic: true }),
  I: () => ({ italic: true }),
  S: () => ({ strikethrough: true }),
  STRONG: () => ({ bold: true }),
  U: () => ({ underline: true }),
};

const HTMLDesirializer = (el: HTMLElement) => {
  console.log("first", el);
  if (el.nodeType === Node.TEXT_NODE) {
    return jsx("text", {}, el.textContent);
  } else if (el.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  let children: any[] = Array.from(el.childNodes)
    .map((node: any) => HTMLDesirializer(node))
    .flat();

  if (children.length === 0) {
    children = [{ text: "" }];
  }

  if (ELEMENT_TAGS[el.nodeName as keyof typeof ELEMENT_TAGS]) {
    const attrs = ELEMENT_TAGS[el.nodeName as keyof typeof ELEMENT_TAGS](el);
    console.log("attrs", attrs);

    if (attrs.type === "ol" || attrs.type === "ul") {
      const filtered = RemoveBreakLineCharacter(children);
      return jsx("element", attrs, filtered);
    }
    if (attrs.type === "li") {
      const validList = ValidateList(children);
      return jsx("element", attrs, validList);
    }

    return jsx("element", attrs, children);
  }
  if (TEXT_TAGS[el.nodeName as keyof typeof TEXT_TAGS]) {
    const attrs = TEXT_TAGS[el.nodeName as keyof typeof TEXT_TAGS]();
    return children.map((child) => jsx("text", attrs, child));
  }

  return children;
};

export const withHTML = (editor: Editor) => {
  const { insertData } = editor;

  editor.insertData = (data) => {
    const html = data.getData("text/html");

    if (html) {
      console.log(html);
      const parse = new DOMParser().parseFromString(html, "text/html");
      const fragment = HTMLDesirializer(parse.body);
      Transforms.insertFragment(editor, fragment as any);
      return;
    }
    insertData(data);
  };

  return editor;
};
