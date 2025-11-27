import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "免責事項・プライバシーポリシー",
  description: "HIFU比較ナビの免責事項とプライバシーポリシー。当サイトの利用に関する注意事項。",
};

export default function PolicyPage() {
  return (
    <div className="py-8 sm:py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <nav className="mb-4 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              ホーム
            </Link>
            <span className="mx-2">/</span>
            <span>免責事項・プライバシーポリシー</span>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            免責事項・プライバシーポリシー
          </h1>
        </div>

        <div className="space-y-8">
          {/* Disclaimer */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-foreground">免責事項</h2>
            <Card>
              <CardContent className="p-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
                <div>
                  <h3 className="font-medium text-foreground">情報の正確性について</h3>
                  <p className="mt-2">
                    当サイトに掲載されている価格情報は、各クリニックの公式サイトから収集したものですが、
                    正確性・最新性を保証するものではありません。
                    施術を受ける際は、必ず各クリニックの公式サイトまたは直接のお問い合わせにて
                    最新情報をご確認ください。
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground">医療アドバイスについて</h3>
                  <p className="mt-2">
                    当サイトは医療機関ではなく、医療アドバイスを提供するものではありません。
                    HIFU施術の適応、リスク、副作用等については、必ず医師にご相談ください。
                    当サイトの情報を参考に行った判断・行動について、
                    当サイトは一切の責任を負いません。
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground">外部リンクについて</h3>
                  <p className="mt-2">
                    当サイトから外部サイトへのリンクは、利便性のために提供しているものであり、
                    リンク先の内容・安全性・信頼性を保証するものではありません。
                    外部サイトのご利用は、各自の責任において行ってください。
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground">損害について</h3>
                  <p className="mt-2">
                    当サイトの利用によって生じた直接的・間接的な損害について、
                    当サイトの運営者は一切の責任を負いません。
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Privacy Policy */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-foreground">プライバシーポリシー</h2>
            <Card>
              <CardContent className="p-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
                <div>
                  <h3 className="font-medium text-foreground">個人情報の収集</h3>
                  <p className="mt-2">
                    当サイトでは、お問い合わせフォーム等を通じて、
                    メールアドレス等の個人情報をお預かりする場合があります。
                    これらの情報は、お問い合わせへの対応のみに使用し、 第三者への提供は行いません。
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground">アクセス解析について</h3>
                  <p className="mt-2">
                    当サイトでは、サービス改善のためアクセス解析ツールを使用しています。
                    これにより、お使いのブラウザから自動的に送信される情報
                    （アクセス日時、ブラウザ種類、参照元等）を収集する場合があります。
                    これらの情報は統計データとして分析され、個人を特定することはありません。
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Cookieの使用</h3>
                  <p className="mt-2">
                    当サイトでは、ユーザー体験の向上やアクセス解析のためにCookieを使用しています。
                    ブラウザの設定でCookieを無効にすることも可能ですが、
                    一部機能が制限される場合があります。
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground">ポリシーの変更</h3>
                  <p className="mt-2">
                    本ポリシーは、必要に応じて変更される場合があります。
                    変更後のポリシーは、当ページに掲載した時点で効力を生じます。
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Last Updated */}
          <p className="text-center text-xs text-muted-foreground/70">最終更新日: 2024年11月1日</p>
        </div>
      </div>
    </div>
  );
}
