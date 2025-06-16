import React from 'react'
import './ComponentTest.css'

// 模擬 Shadcn UI 組件
const Button = ({ variant = "default", size = "default", children, ...props }) => {
  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  }
  
  const sizeClasses = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  }
  
  return (
    <button 
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]}`}
      {...props}
    >
      {children}
    </button>
  )
}

const Card = ({ children, className = "" }) => {
  return (
    <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
      {children}
    </div>
  )
}

const CardHeader = ({ children }) => {
  return <div className="flex flex-col space-y-1.5 p-6">{children}</div>
}

const CardTitle = ({ children }) => {
  return <h3 className="text-2xl font-semibold leading-none tracking-tight">{children}</h3>
}

const CardDescription = ({ children }) => {
  return <p className="text-sm text-muted-foreground">{children}</p>
}

const CardContent = ({ children }) => {
  return <div className="p-6 pt-0">{children}</div>
}

const CardFooter = ({ children }) => {
  return <div className="flex items-center p-6 pt-0">{children}</div>
}

const Input = ({ className = "", ...props }) => {
  return (
    <input
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  )
}

const Tabs = ({ defaultValue, children }) => {
  return <div data-orientation="horizontal" className="w-full">{children}</div>
}

const TabsList = ({ children }) => {
  return (
    <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
      {children}
    </div>
  )
}

const TabsTrigger = ({ value, children, isActive = false }) => {
  return (
    <button 
      data-state={isActive ? "active" : "inactive"} 
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${isActive ? "bg-background text-foreground shadow-sm" : ""}`}
    >
      {children}
    </button>
  )
}

const TabsContent = ({ value, children, isActive = false }) => {
  return (
    <div 
      data-state={isActive ? "active" : "inactive"}
      className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${isActive ? "" : "hidden"}`}
    >
      {children}
    </div>
  )
}

const Avatar = ({ src, alt, fallback }) => {
  return (
    <div className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
      {src ? (
        <img className="aspect-square h-full w-full" src={src} alt={alt} />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
          {fallback}
        </div>
      )}
    </div>
  )
}

const Badge = ({ variant = "default", children }) => {
  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground",
  }
  
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variantClasses[variant]}`}>
      {children}
    </div>
  )
}

const Switch = ({ id, checked = false }) => {
  return (
    <button 
      type="button" 
      role="switch" 
      aria-checked={checked}
      data-state={checked ? "checked" : "unchecked"}
      className="peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
      id={id}
    >
      <span 
        data-state={checked ? "checked" : "unchecked"} 
        className="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0" 
      />
    </button>
  )
}

function ComponentTest() {
  return (
    <div className="component-test">
      <h1 className="text-3xl font-bold mb-8">組件測試頁面</h1>
      
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">按鈕 (Button)</h2>
        <div className="flex flex-wrap gap-4">
          <Button>預設按鈕</Button>
          <Button variant="destructive">危險按鈕</Button>
          <Button variant="outline">輪廓按鈕</Button>
          <Button variant="secondary">次要按鈕</Button>
          <Button variant="ghost">幽靈按鈕</Button>
          <Button variant="link">連結按鈕</Button>
          <Button size="sm">小按鈕</Button>
          <Button size="lg">大按鈕</Button>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">卡片 (Card)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>卡片標題</CardTitle>
              <CardDescription>這是卡片的描述文字，可以提供更多資訊。</CardDescription>
            </CardHeader>
            <CardContent>
              <p>這是卡片的主要內容區域，可以放置各種元素。</p>
            </CardContent>
            <CardFooter>
              <Button>確認</Button>
            </CardFooter>
          </Card>
          
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>使用者資訊</CardTitle>
              <CardDescription>顯示使用者基本資料</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Avatar fallback="JD" />
                <div>
                  <p className="text-sm font-medium">王小明</p>
                  <p className="text-xs text-muted-foreground">user@example.com</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="ghost">取消</Button>
              <Button>儲存</Button>
            </CardFooter>
          </Card>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">輸入框 (Input)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">姓名</label>
            <Input id="name" placeholder="請輸入姓名" />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">電子郵件</label>
            <Input id="email" type="email" placeholder="請輸入電子郵件" />
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">標籤頁 (Tabs)</h2>
        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account" isActive={true}>帳戶設定</TabsTrigger>
            <TabsTrigger value="password">密碼設定</TabsTrigger>
            <TabsTrigger value="notifications">通知設定</TabsTrigger>
          </TabsList>
          <TabsContent value="account" isActive={true}>
            <Card>
              <CardHeader>
                <CardTitle>帳戶設定</CardTitle>
                <CardDescription>管理您的帳戶資訊和偏好設定。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <label htmlFor="username" className="text-sm font-medium">使用者名稱</label>
                  <Input id="username" defaultValue="王小明" />
                </div>
                <div className="space-y-1">
                  <label htmlFor="email" className="text-sm font-medium">電子郵件</label>
                  <Input id="email" defaultValue="user@example.com" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>儲存變更</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
      
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">頭像 (Avatar)</h2>
        <div className="flex flex-wrap gap-4">
          <Avatar fallback="JD" />
          <Avatar fallback="WX" />
          <Avatar fallback="CL" />
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">徽章 (Badge)</h2>
        <div className="flex flex-wrap gap-2">
          <Badge>預設</Badge>
          <Badge variant="secondary">次要</Badge>
          <Badge variant="destructive">危險</Badge>
          <Badge variant="outline">輪廓</Badge>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">開關 (Switch)</h2>
        <div className="flex items-center space-x-2">
          <Switch id="airplane-mode" />
          <label htmlFor="airplane-mode" className="text-sm font-medium">
            飛航模式
          </label>
        </div>
      </section>
    </div>
  )
}

export default ComponentTest 