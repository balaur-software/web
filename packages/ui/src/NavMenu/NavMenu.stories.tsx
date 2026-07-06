import type { Meta, StoryObj } from "@storybook/react";
import { NavMenu, type NavMenuItem } from "./NavMenu.tsx";

const ITEMS: NavMenuItem[] = [
  {
    label: "PRODUCT",
    cards: [
      { glyph: "▛", title: "Renderer", desc: "2×4 cell raster", href: "#image" },
      { glyph: "▞", title: "Palette", desc: "16 ANSI hues", href: "#palette" },
      { glyph: "▙", title: "Dither", desc: "ordered Bayer", href: "#image" },
      { glyph: "▟", title: "Glyph Map", desc: "256 states", href: "#glyphs" },
    ],
  },
  {
    label: "RESOURCES",
    links: [
      { label: "Documentation" },
      { label: "Changelog" },
      { label: "Examples" },
      { label: "API reference" },
    ],
  },
  { label: "PRICING", href: "#pricing" },
];

const meta: Meta<typeof NavMenu> = {
  title: "OCTANT/NavMenu",
  component: NavMenu,
  args: { items: ITEMS },
};
export default meta;
type Story = StoryObj<typeof NavMenu>;

/** The reference bar — hover PRODUCT for the mega grid, RESOURCES for a link list; PRICING is a bare link. */
export const Default: Story = {};

/** A single mega panel with a three-column card grid. */
export const WideMega: Story = {
  args: {
    items: [
      {
        label: "PLATFORM",
        columns: 3,
        width: 560,
        cards: [
          { glyph: "▛", title: "Renderer", desc: "2×4 cell raster" },
          { glyph: "▜", title: "Encoder", desc: "octant packer" },
          { glyph: "▙", title: "Dither", desc: "ordered Bayer" },
          { glyph: "▟", title: "Palette", desc: "16 ANSI hues" },
          { glyph: "▚", title: "Glyph Map", desc: "256 states" },
          { glyph: "▞", title: "Export", desc: "PNG · ANSI · SVG" },
        ],
      },
      { label: "DOCS", href: "#docs" },
    ],
  },
};

/** Only compact link-list panels — no mega grid. */
export const LinkLists: Story = {
  args: {
    items: [
      {
        label: "COMPANY",
        links: [{ label: "About" }, { label: "Careers" }, { label: "Blog" }, { label: "Contact" }],
      },
      {
        label: "DEVELOPERS",
        links: [{ label: "API reference" }, { label: "SDKs" }, { label: "Status" }],
      },
      { label: "PRICING", href: "#pricing" },
    ],
  },
};

/** Every entry is a bare link — the bar degrades to a plain nav strip. */
export const LinksOnly: Story = {
  args: {
    items: [
      { label: "HOME", href: "#home" },
      { label: "DOCS", href: "#docs" },
      { label: "PRICING", href: "#pricing" },
      { label: "BLOG", href: "#blog" },
    ],
  },
};
