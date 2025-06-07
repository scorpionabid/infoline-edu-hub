
# Komponent və Props Xətaları

Bu sənəd InfoLine layihəsində rast gəlinən komponent və props xətaları və onların həll yollarını əhatə edir.

## 1. Props Uyğunsuzluğu

**Problem**: Props tipləri ötürülən dəyərlərlə uyğun gəlmir.

**Xəta Nümunələri**:
- `Type '{ prop1: string; prop2: number; }' is not assignable to type 'ComponentProps'`
- `Property 'X' does not exist on type 'ComponentProps'`

**Həllər**:
- Props interface-ni düzgün təyin edin
- PropTypes və ya TypeScript istifadə edin
- Çoxlu props əvəzinə bir obyekt ötürün
- İsteğe bağlı propslar üçün varsayılan dəyərlər müəyyənləşdirin

**Nümunə**:
```typescript
// Düzgün props interfeysi
interface ButtonProps {
  text: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

// Komponentdə varsayılan dəyər təyini
const Button: React.FC<ButtonProps> = ({ 
  text, 
  onClick, 
  variant = 'primary' 
}) => {
  return (
    <button 
      className={`btn btn-${variant}`} 
      onClick={onClick}
    >
      {text}
    </button>
  );
};
```

## 2. DOM Element Xətaları

**Problem**: JSX elementlərinə ötürülən xassələrin DOM tipləri ilə uyğunsuzluğu.

**Xəta Nümunələri**:
- `Type 'X' is not assignable to type 'HTMLButtonElement'`
- `Property 'X' does not exist on type 'HTMLDivElement'`

**Həllər**:
- React.ComponentProps<> və ya JSX.IntrinsicElements tipindən istifadə edin
- HTML elementlərinin tipi üçün React.HTMLAttributes<> və ya React.ButtonHTMLAttributes<> kimi tiplər istifadə edin

**Nümunə**:
```typescript
// Button komponentində DOM element xassələrinin ötürülməsi
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  className,
  ...props
}) => {
  return (
    <button 
      className={`btn btn-${variant} ${className || ''}`} 
      {...props} 
    />
  );
};
```

## 3. Children Props Xətaları

**Problem**: React.Children və ya children propsunun yanlış istifadəsi.

**Xəta Nümunələri**:
- `Property 'children' does not exist on type 'X'`
- `Type 'X' is not assignable to type 'ReactNode'`

**Həllər**:
- React.ReactNode və ya React.ReactElement tipindən istifadə edin
- Children tipini düzgün təyin edin
- Children validation funksiyaları əlavə edin

**Nümunə**:
```typescript
// Children tipinin düzgün təyin edilməsi
interface CardProps {
  title: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children }) => {
  return (
    <div className="card">
      <div className="card-header">{title}</div>
      <div className="card-body">{children}</div>
    </div>
  );
};

// Və ya daha xüsusi children tipi
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return <ul>{items.map((item, index) => <li key={index}>{renderItem(item)}</li>)}</ul>;
}
```

## 4. Ref Problemləri

**Problem**: React ref'lərinin ötürülməsi və ya forwarding ref əməliyyatlarında xətalar.

**Xəta Nümunələri**:
- `Property 'current' does not exist on type 'X'`
- `Cannot assign to 'ref' because it is a read-only property`

**Həllər**:
- Düzgün ref tipi istifadə edin (React.RefObject və ya React.MutableRefObject)
- forwardRef ilə isləyərkən ref tipini düzgün təyin edin
- useRef hook'unun generic parametrini göstərin

**Nümunə**:
```typescript
// useRef ilə düzgün tip
const inputRef = useRef<HTMLInputElement>(null);

// forwardRef ilə düzgün istifadə
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, ...props }, ref) => {
    return (
      <div>
        <label>{label}</label>
        <input ref={ref} {...props} />
      </div>
    );
  }
);
```

## 5. Hook İstifadə Xətaları

**Problem**: React Hook'ların yanlış istifadəsi.

**Xəta Nümunələri**:
- `React Hook "useX" is called conditionally`
- `React Hook "useX" cannot be called inside a callback`

**Həllər**:
- Hook'ları komponentlərin və ya digər hook'ların əvvəlində istifadə edin
- Şərti ifadələr içərisində hook çağırmayın
- Custom hook'lar üçün "use" prefiksi istifadə edin

**Nümunə**:
```typescript
// YANLIŞ: Şərti hook istifadəsi
function MyComponent({ condition }) {
  if (condition) {
    useEffect(() => {
      // ...
    }, []);
  }
  return <div />;
}

// DOĞRU: Şərti ifadəni hook daxilində istifadə edin
function MyComponent({ condition }) {
  useEffect(() => {
    if (condition) {
      // ...
    }
  }, [condition]);
  return <div />;
}
```

## Həll olunmuş xətalar

| Xəta | Həlli | Tarix |
|------|-------|-------|
| Property 'selectedType' does not exist on useColumnForm return type | useColumnForm tipində eksik xassələr əlavə edildi | 2025-05-08 |
| Property 'schoolStats' does not exist on type 'IntrinsicAttributes & SchoolStatsCardProps' | SchoolStatsCardProps interfeysi düzəldildi | 2025-05-08 |
| Expected 1 arguments, but got 3 | Funksiya çağırışı düzəldildi və parametr sayı uyğunlaşdırıldı | 2025-05-08 |

## Digər xətalar

Burada əlavə komponent xətalarını və həllərini qeyd edə bilərsiniz:

1. ...
2. ...
3. ...
