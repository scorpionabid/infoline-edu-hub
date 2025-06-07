# Data Entry Test Ssenarisi

## Problemin həlli yoxlanılmalıdır:

### 1. Browser console-ı açın (F12)
### 2. Data Entry səhifəsinə daxil olun
### 3. Hər hansı kateqoriya seçin
### 4. Sütunlara məlumat daxil edin
### 5. "Saxla" düyməsinə basın

## Gözlənilən nəticə:
✅ Məlumatlar uğurla saxlanılmalıdır
✅ 400 Bad Request xətası olmamalıdır  
✅ Console-da "UUID format error" olmamalıdır
✅ Network tab-da POST sorğusu 200 OK qaytarmalıdır

## Console loglarını yoxlayın:
- "User ID for insert operation: [uuid]" - UUID olmalıdır
- "created_by: [uuid]" - UUID və ya null olmalıdır  
- "system" stringi hech yerdə olmamalıdır

## Əgər problem davam edərsə:
1. Browser cache-ni təmizləyin (Ctrl+Shift+R)
2. LocalStorage-ni təmizləyin
3. Yenidən giriş edin

## Məlumat əldə etmək üçün:
Console-da bu kodu çalışdırın:
```javascript
console.log('Current user:', localStorage.getItem('infoline-user'));
console.log('Auth token:', localStorage.getItem('sb-olbfnauhzpdskqnxtwav-auth-token'));
```
