import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "運営について",
  description: "HIFU比較ナビの運営方針とデータの透明性について。価格情報の収集方法と更新ポリシー。",
};

export default function AboutPage() {
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
            <span>運営について</span>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            運営について
          </h1>
        </div>

        <div className="space-y-8">
          {/* Mission */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-foreground">サイトの目的</h2>
            <Card>
              <CardContent className="p-6">
                <p className="leading-relaxed text-muted-foreground">
                  HIFU比較ナビは、HIFU施術を検討している方が
                  <strong className="text-foreground">
                    同じ条件で価格を比較し、信頼できる情報をもとに意思決定できる
                  </strong>
                  ことを目的としています。
                </p>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  美容医療の価格情報は、クリニックごとに表記方法がバラバラで、
                  ユーザーが比較しづらい状況にあります。
                  当サイトでは「機種×部位×ショット数×価格種別」で正規化し、
                  公平な比較ができる環境を提供します。
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Data Policy */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-foreground">データの透明性</h2>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="font-medium text-foreground">価格情報の収集方法</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    すべての価格情報は、各クリニックの公式サイトから手動で収集しています。
                    電話確認や実際の来院による確認は行っていないため、
                    最新情報は必ず公式サイトでご確認ください。
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground">根拠URLと確認日の表示</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    すべての価格情報には「根拠URL」と「確認日」を表示しています。
                    これにより、情報の出典と鮮度を透明化し、
                    ユーザーが自ら確認できる環境を担保しています。
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground">更新頻度</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    価格情報は定期的に確認・更新を行っていますが、
                    クリニック側の価格改定にリアルタイムで追従することは困難です。
                    確認日が古い情報については、公式サイトでの確認をお願いします。
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* No Ads Policy */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              広告・アフィリエイトについて
            </h2>
            <Card>
              <CardContent className="p-6">
                <p className="leading-relaxed text-muted-foreground">
                  当サイトは現時点でアフィリエイトリンクを含んでいません。
                  掲載順位やおすすめ表示は、広告費ではなく、
                  価格・更新日・閲覧数などの客観的指標に基づいています。
                </p>
                <p className="mt-4 text-sm text-muted-foreground/80">
                  ※ 将来的に収益化を行う場合も、掲載順位への影響は明示します。
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Contact */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-foreground">お問い合わせ</h2>
            <Card>
              <CardContent className="p-6">
                <p className="leading-relaxed text-muted-foreground">
                  価格情報の誤りや更新依頼、その他お問い合わせは以下までご連絡ください。
                </p>
                <p className="mt-4 text-foreground">メール: contact@example.com</p>
                <p className="mt-4 text-xs text-muted-foreground/70">
                  ※ 個別のクリニック相談や医療アドバイスには対応しておりません。
                </p>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
