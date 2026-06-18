/**
 * 登录页面独立布局 - 不包含 admin 主布局（避免重定向循环）
 */
export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}