"use client";

import Image from "next/image";
import React from "react";

interface UserAvatarProps {
  name?: string | null;
  image?: string | null;
  size?: "xsmall" | "small" | "medium" | "large" | "xlarge" | "xxlarge";
  className?: string;
}

const sizeClasses = {
  xsmall: "h-6 w-6 min-w-6 text-xs",
  small: "h-8 w-8 min-w-8 text-xs",
  medium: "h-10 w-10 min-w-10 text-sm",
  large: "h-11 w-11 min-w-11 text-sm",
  xlarge: "h-14 w-14 min-w-14 text-base",
  xxlarge: "h-20 w-20 min-w-20 text-lg",
};

const getInitials = (name?: string | null): string => {
  if (!name?.trim()) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2);
  }
  return name.slice(0, 2).toUpperCase();
};

const getColorClass = (name: string): string => {
  const colors = [
    "bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400",
    "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
    "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
    "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  ];
  const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  image,
  size = "medium",
  className = "",
}) => {
  const sizeClass = sizeClasses[size];
  const initials = getInitials(name);

  if (image?.trim()) {
    const isExternal = image.startsWith("http");
    return (
      <span
        className={`relative block overflow-hidden rounded-full shrink-0 ${sizeClass} ${className}`}
      >
        {isExternal ? (
          <img
            src={image}
            alt={name || "User"}
            className="absolute inset-0 h-full w-full object-cover object-center rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          <Image
            src={image}
            alt={name || "User"}
            fill
            sizes="(max-width: 48px) 48px, 96px"
            className="object-cover object-center rounded-full"
          />
        )}
      </span>
    );
  }

  return (
    <span
      className={`flex items-center justify-center rounded-full font-medium ${sizeClass} ${getColorClass(
        name || "user"
      )} ${className}`}
    >
      {initials}
    </span>
  );
};

export default UserAvatar;
