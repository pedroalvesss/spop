import {
  Airplane,
  ArrowDownLeft,
  ArrowsDownUp,
  Baby,
  Bank,
  Barbell,
  BookOpen,
  Briefcase,
  Bus,
  CalendarCheck,
  Car,
  ChartBar,
  ChartPieSlice,
  Coffee,
  CreditCard,
  DesktopTower,
  DeviceMobile,
  DotsThreeOutline,
  Drop,
  FilmSlate,
  FirstAidKit,
  GameController,
  GasPump,
  GearSix,
  Gift,
  GraduationCap,
  Hamburger,
  HandCoins,
  Heart,
  House,
  HouseLine,
  Laptop,
  Lightning,
  MusicNotes,
  PawPrint,
  PiggyBank,
  Receipt,
  ShoppingCart,
  Star,
  SunHorizon,
  TShirt,
  TelevisionSimple,
  TrendUp,
  Umbrella,
  WifiHigh,
  Wrench,
} from "@phosphor-icons/react/ssr";
import type { Icon as PhosphorIcon, IconWeight } from "@phosphor-icons/react";

// Ícones guardados no banco pelo nome (kebab-case, como no Phosphor).
const ICONS: Record<string, PhosphorIcon> = {
  airplane: Airplane,
  "arrow-down-left": ArrowDownLeft,
  "arrows-down-up": ArrowsDownUp,
  baby: Baby,
  bank: Bank,
  barbell: Barbell,
  "book-open": BookOpen,
  briefcase: Briefcase,
  bus: Bus,
  "calendar-check": CalendarCheck,
  car: Car,
  "chart-bar": ChartBar,
  "chart-pie-slice": ChartPieSlice,
  coffee: Coffee,
  "credit-card": CreditCard,
  "desktop-tower": DesktopTower,
  "device-mobile": DeviceMobile,
  "dots-three-outline": DotsThreeOutline,
  drop: Drop,
  "film-slate": FilmSlate,
  "first-aid-kit": FirstAidKit,
  "game-controller": GameController,
  "gas-pump": GasPump,
  "gear-six": GearSix,
  gift: Gift,
  "graduation-cap": GraduationCap,
  hamburger: Hamburger,
  "hand-coins": HandCoins,
  heart: Heart,
  house: House,
  "house-line": HouseLine,
  laptop: Laptop,
  lightning: Lightning,
  "music-notes": MusicNotes,
  "paw-print": PawPrint,
  "piggy-bank": PiggyBank,
  receipt: Receipt,
  "shopping-cart": ShoppingCart,
  star: Star,
  "sun-horizon": SunHorizon,
  "t-shirt": TShirt,
  "television-simple": TelevisionSimple,
  "trend-up": TrendUp,
  umbrella: Umbrella,
  "wifi-high": WifiHigh,
  wrench: Wrench,
};

const NAV_ONLY = new Set([
  "arrows-down-up",
  "calendar-check",
  "chart-bar",
  "chart-pie-slice",
  "gear-six",
  "house",
]);

// Opções do seletor de ícone (categorias, contas, dívidas, caixinhas).
export const ICON_CHOICES = Object.keys(ICONS).filter((name) => !NAV_ONLY.has(name));

interface IconProps {
  name: string;
  weight?: IconWeight;
  className?: string;
}

export function Icon({ name, weight = "regular", className }: IconProps) {
  const Component = ICONS[name] ?? DotsThreeOutline;
  return <Component weight={weight} className={className} aria-hidden="true" />;
}
