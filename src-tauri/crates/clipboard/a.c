#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <X11/Xlib.h>
#include <X11/Xatom.h>
#include <X11/extensions/Xfixes.h>

void get_clipboard_content(Display *display, Window window) {
    Atom clipboard = XInternAtom(display, "CLIPBOARD", False);
    Atom utf8 = XInternAtom(display, "UTF8_STRING", False);
    Atom targets = XInternAtom(display, "TARGETS", False);
    Atom prop = XInternAtom(display, "MY_CLIPBOARD", False);

    // Request the clipboard owner to convert to UTF8_STRING
    XConvertSelection(display, clipboard, utf8, prop, window, CurrentTime);
    XFlush(display);

    // Wait for SelectionNotify
    XEvent event;
    while (1) {
        XNextEvent(display, &event);
        if (event.type == SelectionNotify) {
            if (event.xselection.selection != clipboard) {
                break;
            }

            if (event.xselection.property == None) {
                printf("Failed to get clipboard data\n");
                return;
            }

            Atom actual_type;
            int actual_format;
            unsigned long nitems, bytes_after;
            unsigned char *data = NULL;

            XGetWindowProperty(display, window, prop, 0, (~0L), False,
                               AnyPropertyType, &actual_type, &actual_format,
                               &nitems, &bytes_after, &data);

            if (data) {
                printf("Clipboard: %s\n", data);
                XFree(data);
            }

            break;
        }
    }
}

int main() {
    Display *display = XOpenDisplay(NULL);
    if (!display) {
        fprintf(stderr, "Cannot open display\n");
        return 1;
    }

    int event_base, error_base;
    if (!XFixesQueryExtension(display, &event_base, &error_base)) {
        fprintf(stderr, "XFixes extension not available\n");
        return 1;
    }

    Window window = XCreateSimpleWindow(display, DefaultRootWindow(display),
                                        0, 0, 1, 1, 0, 0, 0);

    Atom clipboard = XInternAtom(display, "CLIPBOARD", False);
    XFixesSelectSelectionInput(display, window, clipboard,
                               XFixesSetSelectionOwnerNotifyMask);

    printf("Listening for clipboard changes...\n");

    while (1) {
        XEvent ev;
        XNextEvent(display, &ev);

        if (ev.type == event_base + XFixesSelectionNotify) {
            XFixesSelectionNotifyEvent *sev = (XFixesSelectionNotifyEvent *)&ev;
            if (sev->selection == clipboard && sev->subtype == 0) {
                // New clipboard owner: fetch the data
                get_clipboard_content(display, window);
            }
        }
    }

    XCloseDisplay(display);
    return 0;
}
