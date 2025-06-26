#!/bin/bash

# Layihənin əsas qovluğu
SRC_DIR="$(pwd)/src"

# Sintaksis xətası olan faylları tapmaq üçün desen
# case 'value': { return...; strukturuna uyğun gəlir
PATTERN="case ['\"][^'\"]*['\"]:\s*{\s*return"

# Bu desen daxilində olan bütün TypeScript/TSX fayllarını tap
echo "Problematik case bloklarını axtarıram..."
FILES=$(grep -l -r -E "$PATTERN" --include="*.ts" --include="*.tsx" "$SRC_DIR")

if [ -z "$FILES" ]; then
  echo "Heç bir problematik fayl tapılmadı."
  exit 0
fi

echo "Aşağıdakı faylarda problematik case bloklarını tapdım:"
echo "$FILES" | sed 's/^/- /'

echo -e "\nDüzəlişlər tətbiq edilsin? [y/N]"
read -r CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
  echo "Proses dayandırıldı."
  exit 0
fi

# Hər bir fayl üçün düzəlişləri tətbiq et
for FILE in $FILES; do
  echo "Düzəldilir: $FILE"
  
  # Fayl məzmununu temp faylına köçür
  TMP_FILE=$(mktemp)
  cp "$FILE" "$TMP_FILE"
  
  # Case bloklarını düzəlt
  # 1. case 'value': { return xxx; -> case 'value':\n        return xxx;
  sed -i -E 's/case ([^:]+): *{ *return/case \1:\n        return/g' "$TMP_FILE"
  
  # Orijinal fayla geri köçür
  mv "$TMP_FILE" "$FILE"
done

echo "Bütün fayllar üçün düzəlişlər tətbiq edildi."
echo "npm run build əmrini işlədərək nəticələri yoxlayın."
