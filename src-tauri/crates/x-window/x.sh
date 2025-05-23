# for wid in $(xdotool search --onlyvisible --name .); do
for wid in $(xdotool search --all --name .); do
    name=$(xdotool getwindowname "$wid")
    printf "%08d 0x%08x  %s\n" "$wid" "$wid" "$name"
done
