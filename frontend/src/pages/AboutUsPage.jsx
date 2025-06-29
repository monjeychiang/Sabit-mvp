import React from "react";
import {
  Github,
  Twitter,
  Mail,
  Users,
  Code,
  Shield,
  Zap,
  Globe,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";

/**
 * 關於我們頁面
 * 展示項目團隊、使命和價值觀
 */
const AboutUsPage = () => {
  // 團隊成員數據
  const teamMembers = [
    {
      name: "王小明",
      role: "創始人 & 首席開發者",
      bio: "資深全棧開發者，擁有10年加密貨幣交易經驗。專注於構建高效、安全的交易系統。",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    {
      name: "林小華",
      role: "UI/UX 設計師",
      bio: "專注於創造直觀、美觀的用戶界面，讓複雜的交易操作變得簡單。",
      avatar: "https://i.pravatar.cc/150?img=2",
    },
    {
      name: "張小強",
      role: "交易策略專家",
      bio: "前量化交易員，擁有豐富的算法交易經驗，負責開發和優化交易策略。",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
    {
      name: "李小芳",
      role: "社群經理",
      bio: "負責用戶支援和社群建設，確保每位用戶都能充分利用 SABIT 的功能。",
      avatar: "https://i.pravatar.cc/150?img=4",
    },
  ];

  // 核心價值觀
  const coreValues = [
    {
      title: "安全第一",
      description:
        "我們將用戶的資產安全放在首位，採用最高級別的加密和安全措施保護您的數據和資金。",
      icon: <Shield className="h-8 w-8 text-primary" />,
    },
    {
      title: "透明開放",
      description:
        "我們的代碼是開源的，交易策略和執行過程完全透明，讓用戶可以完全掌控自己的交易。",
      icon: <Code className="h-8 w-8 text-primary" />,
    },
    {
      title: "高效可靠",
      description:
        "我們致力於構建高性能、低延遲的交易系統，確保您的策略能夠準確無誤地執行。",
      icon: <Zap className="h-8 w-8 text-primary" />,
    },
    {
      title: "用戶至上",
      description:
        "我們不斷聆聽用戶反饋，持續改進產品，讓 SABIT 成為最符合用戶需求的交易工具。",
      icon: <Users className="h-8 w-8 text-primary" />,
    },
  ];

  return (
    <div className="container mx-auto py-12 px-4">
      {/* 頂部橫幅 */}
      <div className="text-center mb-16">
        <div className="flex justify-center mb-6">
          <Logo size="large" />
        </div>
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          關於我們
        </h1>
        <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
          我們是一個致力於讓加密貨幣交易變得更簡單、更高效的團隊。
        </p>
      </div>

      {/* 我們的使命 */}
      <div className="mb-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center">我們的使命</h2>
          <p className="text-lg text-muted-foreground mb-6">
            SABIT
            的使命是為每一位加密貨幣交易者提供專業、高效、安全的自動化交易工具，無論是經驗豐富的專業交易者還是剛入門的新手。
          </p>
          <p className="text-lg text-muted-foreground mb-6">
            我們相信，通過自動化和智能化的交易策略，可以幫助用戶在波動的加密貨幣市場中獲得更穩定的收益，同時降低交易的時間成本和心理壓力。
          </p>
          <p className="text-lg text-muted-foreground">
            作為一個開源項目，我們歡迎社群的參與和貢獻，共同打造最優秀的加密貨幣交易工具。
          </p>
        </div>
      </div>

      {/* 核心價值觀 */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold mb-10 text-center">核心價值觀</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {coreValues.map((value, index) => (
            <div
              key={index}
              className="bg-card rounded-lg border p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="mb-4">{value.icon}</div>
              <h3 className="text-xl font-bold mb-2">{value.title}</h3>
              <p className="text-muted-foreground">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 團隊成員 */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold mb-10 text-center">認識我們的團隊</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="bg-card rounded-lg border overflow-hidden shadow-sm transition-all hover:shadow-md"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold">{member.name}</h3>
                <p className="text-sm text-primary mb-2">{member.role}</p>
                <p className="text-muted-foreground">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 聯繫我們 */}
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6">與我們聯繫</h2>
        <p className="text-lg text-muted-foreground mb-8">
          我們歡迎您的反饋、建議或合作提案。請通過以下方式與我們聯繫。
        </p>
        <div className="flex justify-center space-x-6">
          <a
            href={import.meta.env.VITE_SOCIAL_GITHUB}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center p-4 hover:text-primary transition-colors"
          >
            <Github className="h-8 w-8 mb-2" />
            <span>GitHub</span>
          </a>
          <a
            href={import.meta.env.VITE_SOCIAL_TWITTER}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center p-4 hover:text-primary transition-colors"
          >
            <Twitter className="h-8 w-8 mb-2" />
            <span>Twitter</span>
          </a>
          <a
            href={`mailto:${import.meta.env.VITE_SOCIAL_EMAIL}`}
            className="flex flex-col items-center p-4 hover:text-primary transition-colors"
          >
            <Mail className="h-8 w-8 mb-2" />
            <span>Email</span>
          </a>
          <a
            href={import.meta.env.VITE_SOCIAL_DISCORD}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center p-4 hover:text-primary transition-colors"
          >
            <Globe className="h-8 w-8 mb-2" />
            <span>Discord</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;
