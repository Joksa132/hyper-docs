import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Palette,
  Printer,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "./ui/button";
import { useCurrentEditor, useEditorState } from "@tiptap/react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { fontFamilies } from "@/lib/helpers";

export function DocumentToolbar() {
  const { editor } = useCurrentEditor();

  const state = useEditorState({
    editor,
    selector: ({ editor }) => {
      if (!editor) return null;

      return {
        isBold: editor.isActive("bold"),
        isItalic: editor.isActive("italic"),
        isUnderline: editor.isActive("underline"),
        isStrike: editor.isActive("strike"),

        isLink: editor.isActive("link"),

        isBulletList: editor.isActive("bulletList"),
        isOrderedList: editor.isActive("orderedList"),
        isBlockquote: editor.isActive("blockquote"),
        isCodeBlock: editor.isActive("codeBlock"),

        canUndo: editor.can().undo(),
        canRedo: editor.can().redo(),

        textAlign:
          editor.getAttributes("paragraph").textAlign ||
          editor.getAttributes("heading").textAlign ||
          "left",

        headingLevel: editor.isActive("heading", { level: 1 })
          ? 1
          : editor.isActive("heading", { level: 2 })
          ? 2
          : editor.isActive("heading", { level: 3 })
          ? 3
          : null,

        fontSize:
          editor.getAttributes("textStyle").fontSize?.replace("px", "") ?? "14",
        fontFamily: editor.getAttributes("textStyle").fontFamily || "",
      };
    },
  });

  return (
    <div className="flex items-center gap-1 border-b border-border px-4 py-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={!state?.canUndo}
          >
            <Undo2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Undo</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={!state?.canRedo}
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Redo</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8">
            <Printer className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Print</TooltipContent>
      </Tooltip>

      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8">
              <ZoomOut className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom Out</TooltipContent>
        </Tooltip>
        <span className="text-xs min-w-6 text-center">100%</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8">
              <ZoomIn className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom In</TooltipContent>
        </Tooltip>
      </div>

      <div className="h-6 w-px shrink-0 bg-border" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 px-3">
            <span className="text-sm">
              {state?.headingLevel ? `Heading ${state.headingLevel}` : "Normal"}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => editor?.chain().focus().setParagraph().run()}
          >
            Normal
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 1 }).run()
            }
          >
            Heading 1
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            Heading 2
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 3 }).run()
            }
          >
            Heading 3
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 px-3">
            <span className="text-sm truncate max-w-[120px]">
              {fontFamilies.find((f) => f.value === state?.fontFamily)?.label ??
                "Font"}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {fontFamilies.map((font) => (
            <DropdownMenuItem
              key={font.label}
              data-active={state?.fontFamily === font.value}
              onClick={() =>
                font.value
                  ? editor?.chain().focus().setFontFamily(font.value).run()
                  : editor?.chain().focus().unsetFontFamily().run()
              }
              className="flex items-center justify-between"
              style={{ fontFamily: font.value || undefined }}
            >
              {font.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 px-3">
            <span className="text-sm">{state?.fontSize ?? "14"}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {[
            "8",
            "10",
            "12",
            "14",
            "16",
            "18",
            "20",
            "24",
            "26",
            "28",
            "30",
            "32",
          ].map((size) => (
            <DropdownMenuItem
              key={size}
              data-active={state?.fontSize === size}
              onClick={() =>
                editor?.chain().focus().setFontSize(`${size}px`).run()
              }
            >
              {size}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="h-6 w-px shrink-0 bg-border" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            data-active={state?.isBold}
            className="h-8 px-2 data-[active=true]:bg-primary"
          >
            <Bold className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Bold</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            data-active={state?.isItalic}
            className="h-8 px-2 data-[active=true]:bg-primary"
          >
            <Italic className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Italic</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            data-active={state?.isUnderline}
            className="h-8 px-2 data-[active=true]:bg-primary"
          >
            <Underline className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Underline</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            data-active={state?.isStrike}
            className="h-8 px-2 data-[active=true]:bg-primary"
          >
            <Strikethrough className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Strikethrough</TooltipContent>
      </Tooltip>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Palette className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent></DropdownMenuContent>
      </DropdownMenu>

      <div className="h-6 w-px shrink-0 bg-border" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            data-active={state?.isLink}
            className="h-8 px-2 data-[active=true]:bg-primary"
          >
            <Link2 className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Insert Link</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <ImageIcon className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Insert Image</TooltipContent>
      </Tooltip>

      <div className="h-6 w-px shrink-0 bg-border" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().setTextAlign("left").run()}
            data-active={state?.textAlign === "left"}
            className="h-8 px-2 data-[active=true]:bg-primary"
          >
            <AlignLeft className="w-4 h-4 data-[active=true]:bg-primary" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Align Left</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().setTextAlign("center").run()}
            data-active={state?.textAlign === "center"}
            className="h-8 px-2 data-[active=true]:bg-primary"
          >
            <AlignCenter className="w-4 h-4 data-[active=true]:bg-primary" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Align Center</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().setTextAlign("right").run()}
            data-active={state?.textAlign === "right"}
            className="h-8 px-2 data-[active=true]:bg-primary"
          >
            <AlignRight className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Align Right</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              editor?.chain().focus().setTextAlign("justify").run()
            }
            data-active={state?.textAlign === "justify"}
            className="h-8 px-2 data-[active=true]:bg-primary"
          >
            <AlignJustify className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Justify</TooltipContent>
      </Tooltip>

      <div className="h-6 w-px shrink-0 bg-border" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            data-active={state?.isBulletList}
            className="h-8 px-2 data-[active=true]:bg-primary"
          >
            <List className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Bullet List</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            data-active={state?.isOrderedList}
            className="h-8 px-2 data-[active=true]:bg-primary"
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Numbered List</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            data-active={state?.isBlockquote}
            className="h-8 px-2 data-[active=true]:bg-primary"
          >
            <Quote className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Quote</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
            data-active={state?.isCodeBlock}
            className="h-8 px-2 data-[active=true]:bg-primary"
          >
            <Code className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Code</TooltipContent>
      </Tooltip>

      <div className="h-6 w-px shrink-0 bg-border" />

      <div>Presence Typing</div>
    </div>
  );
}
