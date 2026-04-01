package com.we297.paf.smart_campus_backend.entity.enums;

import java.util.Locale;

/**
 * Maps MongoDB-stored type strings (including legacy formats) to {@link ResourceType}.
 */
public final class ResourceTypeParser {

    private ResourceTypeParser() {
    }

    /**
     * Parses stored value from MongoDB or API. Handles legacy values such as "MEETING ROOM".
     */
    public static ResourceType parse(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String n = raw.trim().toUpperCase(Locale.ROOT).replace(' ', '_');
        try {
            return ResourceType.valueOf(n);
        } catch (IllegalArgumentException ignored) {
            // e.g. "MEETINGROOM" or other typos
            try {
                return ResourceType.valueOf(n.replace("_", ""));
            } catch (IllegalArgumentException ignored2) {
                return null;
            }
        }
    }

    /**
     * Canonical string to persist (enum name). Use after parse for normalizing legacy rows.
     */
    public static String toCanonical(String raw) {
        ResourceType t = parse(raw);
        return t != null ? t.name() : raw;
    }
}
