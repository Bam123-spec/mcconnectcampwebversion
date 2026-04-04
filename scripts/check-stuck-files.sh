#!/bin/bash

# Find files that are marked as dataless by iCloud recursively
echo "Checking for iCloud stuck/dataless files..."

# Use find and ls -lO to look for the 'dataless' flag recursively, excluding node_modules and .git
STUCK_FILES=$(find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*" -exec ls -lO {} + 2>/dev/null | grep "dataless" | awk '{print $NF}')

if [ -z "$STUCK_FILES" ]; then
    echo "✅ Project health check passed. No stuck files found."
    exit 0
else
    echo "❌ Error: Found stuck iCloud files that will cause the bundler to hang:"
    echo "$STUCK_FILES"
    echo ""
    echo "❗️ IMPORTANT ❗️"
    echo "These files have been offloaded by iCloud Drive 'Optimize Mac Storage'."
    echo "You must force macOS to download them. Try clicking the cloud icon next to them in Finder,"
    echo "or try turning off 'Optimize Mac Storage' in your iCloud settings."
    exit 1
fi
