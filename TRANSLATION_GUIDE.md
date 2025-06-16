# Translation Guide for InfoLine

## Key Naming Conventions

### 1. Structure
- Use dot notation for nested structures
- Group related translations under common prefixes
- Follow `namespace.component.element` pattern

### 2. Key Patterns

#### Common UI Elements
```typescript
// Buttons
common.buttons.save = "Yadda saxla"
common.buttons.cancel = "Ləğv et"
common.buttons.submit = "Təsdiq et"

// Form Labels
form.labels.username = "İstifadəçi adı"
form.labels.password = "Şifrə"
form.labels.email = "E-poçt"

// Placeholders
form.placeholders.search = "Axtarış..."
form.placeholders.select = "Seçin..."

// Messages
messages.success.saved = "Uğurla yadda saxlanıldı"
messages.error.generic = "Xəta baş verdi"
```

#### Component-Specific
```typescript
// For a UserProfile component
userProfile.title = "Profil məlumatları"
userProfile.fields.name = "Ad"
userProfile.fields.surname = "Soyad"
userProfile.buttons.edit = "Redaktə et"

// For a DataTable component
dataTable.pagination.itemsPerPage = "Səhifə başına: {count}"
dataTable.noData = "Məlumat tapılmadı"
```

### 3. Language-Specific Rules

#### Azerbaijani (az)
- Use proper Azerbaijani characters (ə, ü, ö, ı, ğ, ş, ç, ğ)
- Follow formal language style
- Use title case for buttons and titles

#### English (en)
- Use title case for UI elements
- Keep it concise but clear

### 4. Dynamic Content

#### Parameters
Use named parameters in curly braces:
```typescript
greeting = "Salam, {name}!"
itemsSelected = "{count} məhsul seçilib"
```

#### Plurals
Handle different plural forms:
```typescript
messages.notification.count = "{count} bildiriş"
messages.notification.count_plural = "{count} bildiriş"
```

### 5. Common Patterns

#### Actions
```typescript
actions.add = "Əlavə et"
actions.edit = "Redaktə et"
actions.delete = "Sil"
actions.view = "Bax"
actions.download = "Yüklə"
```

#### Messages
```typescript
messages.loading = "Yüklənir..."
messages.saving = "Yadda saxlanılır..."
messages.success = "Uğurla tamamlandı"
messages.error = "Xəta baş verdi"
messages.warning = "Xəbərdarlıq"
```

## Best Practices

1. **Be Consistent**
   - Use the same terms for the same concepts
   - Follow established patterns

2. **Keep it Contextual**
   - Include enough context in the key names
   - Avoid generic keys like "title" or "name"

3. **Plan for Growth**
   - Structure keys to allow for future additions
   - Leave room for related translations

4. **Test Thoroughly**
   - Check all dynamic content
   - Verify all languages
   - Test with long strings

## Migration Guidelines

### From Old to New System
1. Move translations from JSON to TypeScript modules
2. Update key names to follow conventions
3. Update component code to use new keys
4. Test all language variants
5. Remove old JSON files after migration

### Adding New Translations
1. Add new keys to all language files
2. Keep keys in the same order across languages
3. Mark missing translations with TODO comments
4. Test with all supported languages

## Example Migration

### Before (JSON)
```json
{
  "login": {
    "title": "Daxil ol",
    "username": "İstifadəçi adı",
    "password": "Şifrə"
  }
}
```

### After (TypeScript Module)
```typescript
// auth/login.ts
export default {
  title: 'Daxil ol',
  form: {
    username: 'İstifadəçi adı',
    password: 'Şifrə',
    submit: 'Daxil ol',
    forgotPassword: 'Şifrəni unutdunuz?'
  },
  messages: {
    success: 'Uğurla daxil oldunuz',
    error: 'Daxil olarkən xəta baş verdi'
  }
} as const;
```

## Tools and Scripts

### Validation
```bash
# Check for missing translations
npm run i18n:validate

# Check for unused keys
npm run i18n:unused
```

### Extraction
```bash
# Extract new keys from source code
npm run i18n:extract
```

## Common Pitfalls to Avoid

1. **Hardcoded Text**
   - Always use translation keys in components
   - No hardcoded strings in JSX

2. **Inconsistent Casing**
   - Stick to camelCase for keys
   - Be consistent with abbreviations

3. **Missing Context**
   - Don't use generic keys like "name" or "title"
   - Include component context in keys

4. **Ignoring Plurals**
   - Always handle singular/plural forms
   - Test with different numbers

5. **Forgetting Variables**
   - Always escape user input
   - Validate all dynamic content

## Review Process

1. Peer review all translation changes
2. Verify all dynamic content
3. Check for consistency with existing patterns
4. Test with all supported languages

## Resources

- [Azerbaijani Language Reference](https://az.wikipedia.org/wiki/Az%C9%99rbaycan_dili)
- [i18n Best Practices](https://www.i18next.com/)
- [Unicode CLDR](http://cldr.unicode.org/)
