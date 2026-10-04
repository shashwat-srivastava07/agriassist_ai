import {
  Bell,
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
} from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

import { supabase } from "@/integrations/supabase/client";
import {
  getNotifications,
  toneClass,
} from "@/lib/farm-mocks";
import { useFarmer } from "@/hooks/useFarmer";
import { cn } from "@/lib/utils";

import { useLanguage } from "@/context/LanguageContext";
import { getTranslations } from "@/lib/i18n";

import {
  applyTheme,
  getResolvedTheme,
  getStoredTheme,
  type Theme,
} from "@/lib/theme";

export function AppTopbar({
  title,
  onMenu,
}: {
  title: string;
  onMenu?: () => void;
}) {
  const [dark, setDark] = useState(false);

  const navigate = useNavigate();

  const {
    name,
    initials,
  } = useFarmer();

  const { language } = useLanguage();

  const t = getTranslations(language);

  const notifications = getNotifications(language);

  /*
   * Translate the page title.
   * The router still sends the original English title,
   * so existing routing does not need to change.
   */
  const translatedTitle =
    title === "AgriAssist AI"
      ? "AgriAssist AI"
      : title === "Dashboard"
        ? t.dashboard
        : title === "Chat"
          ? t.chat
          : title === "Command Center"
            ? t.commandCenter
            : title === "Disease Scanner"
              ? t.diseaseScanner
              : title === "Weather"
                ? t.weather
                : title === "Farm Planner"
                  ? t.farmPlanner
                  : title === "Market Intelligence"
                    ? t.marketIntelligence
                    : title === "Reports"
                      ? t.reports
                      : title === "Farm Profile"
                        ? t.profile
                        : title === "Settings"
                          ? t.settings
                          : title;

  /*
   * Read the saved theme when the topbar mounts and
   * stay synchronized with the Settings page.
   */
  useEffect(() => {
    const storedTheme = getStoredTheme();

    applyTheme(storedTheme);
    setDark(getResolvedTheme() === "dark");

    const handleThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent<Theme>;
      const nextTheme = customEvent.detail;

      setDark(
        nextTheme === "dark" ||
          (nextTheme === "system" &&
            window.matchMedia(
              "(prefers-color-scheme: dark)",
            ).matches),
      );
    };

    window.addEventListener(
      "agriassist-theme-change",
      handleThemeChange,
    );

    return () => {
      window.removeEventListener(
        "agriassist-theme-change",
        handleThemeChange,
      );
    };
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();

    navigate({
      to: "/login",
      replace: true,
    });
  }

  function toggleTheme() {
    const nextTheme: Theme = dark
      ? "light"
      : "dark";

    applyTheme(nextTheme);
    setDark(nextTheme === "dark");
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl md:px-6">
      {/* Mobile menu */}
      {onMenu && (
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenu}
          aria-label={t.openMenu}
        >
          ☰
        </Button>
      )}

      {/* Page title */}
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-base font-semibold tracking-tight md:text-lg">
          {translatedTitle}
        </h1>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t.notifications}
              className="relative"
            >
              <Bell className="h-[18px] w-[18px]" />

              <Badge className="absolute -top-0.5 -right-0.5 h-4 min-w-4 justify-center rounded-full bg-accent p-0 text-[10px] text-accent-foreground">
                {notifications.length}
              </Badge>
            </Button>
          </PopoverTrigger>

          <PopoverContent
            align="end"
            className="w-[360px] p-0"
          >
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <div>
                <div className="font-display text-sm font-semibold">
                  {t.farmAlerts}
                </div>

                <div className="text-[11px] text-muted-foreground">
                  {t.personalizedFarm}
                </div>
              </div>

              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-[11px] text-muted-foreground"
              >
                {t.markAllRead}
              </Button>
            </div>

            <ScrollArea className="max-h-[380px]">
              <ul>
                {notifications.map(
                  (notification, i) => {
                    const Icon =
                      notification.icon;

                    return (
                      <li
                        key={i}
                        className="flex items-start gap-3 border-b border-border/40 px-4 py-3 last:border-b-0 hover:bg-muted/30"
                      >
                        <div
                          className={cn(
                            "shrink-0 rounded-lg p-2",
                            toneClass[
                              notification.tone
                            ],
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="truncate text-sm font-medium">
                              {
                                notification.title
                              }
                            </div>

                            <div className="whitespace-nowrap text-[10px] text-muted-foreground">
                              {
                                notification.time
                              }
                            </div>
                          </div>

                          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                            {
                              notification.body
                            }
                          </p>
                        </div>
                      </li>
                    );
                  },
                )}
              </ul>
            </ScrollArea>
          </PopoverContent>
        </Popover>

        {/* Theme */}
        <Button
          variant="ghost"
          size="icon"
          aria-label={t.toggleTheme}
          onClick={toggleTheme}
        >
          {dark ? (
            <Sun className="h-[18px] w-[18px]" />
          ) : (
            <Moon className="h-[18px] w-[18px]" />
          )}
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={name}
            >
              <Avatar className="h-8 w-8 ring-2 ring-primary/30">
                <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-56"
          >
            <DropdownMenuLabel className="capitalize">
              {name}
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link to="/farm-profile">
                <User className="mr-2 h-4 w-4" />
                {t.farmProfile}
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link to="/settings">
                <Settings className="mr-2 h-4 w-4" />
                {t.settings}
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onSelect={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t.signOut}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}