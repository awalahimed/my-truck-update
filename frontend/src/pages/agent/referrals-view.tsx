"use client";

import { useEffect, useState } from "react";
import { orpc } from "@/lib/oprc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";

export default function ReferralsView() {
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [myCode, setMyCode] = useState<string>("");
  const [shareUrl, setShareUrl] = useState<string>("");
  const [codeCopied, setCodeCopied] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [messageCopied, setMessageCopied] = useState(false);

  useEffect(() => {
    fetchReferrals();
    fetchMyCode();
  }, []);

  const fetchMyCode = async () => {
    try {
      const res = await orpc.referral.getMyReferralCode();
      if (res && res.code) {
        setMyCode(res.code);
        setShareUrl(res.shareUrl);
      }
    } catch (e) {
      console.error('Failed to fetch referral code', e);
    }
  };

  const copyToClipboard = (text: string, type: 'code' | 'url' | 'message') => {
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setUrlCopied(true);
      toast.success('Share URL copied!');
      setTimeout(() => setUrlCopied(false), 2000);
    } else if (type === 'message') {
      setMessageCopied(true);
      toast.success('Message copied!');
      setTimeout(() => setMessageCopied(false), 2000);
    } else {
      setCodeCopied(true);
      toast.success('Code copied!');
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const res = await orpc.referral.getHistory();
      if (res && res.referrals) setReferrals(res.referrals);
      else setReferrals([]);
    } catch (e) {
      console.error('Failed to fetch referrals', e);
      toast.error('Failed to load referrals');
      setReferrals([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Referrals</h2>
        <div>
          <Button size="sm" onClick={fetchReferrals}>Refresh</Button>
        </div>
      </div>

      {/* My Referral Code Card */}
      {myCode && (
        <Card className="bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-200">
          <CardHeader>
            <CardTitle className="text-teal-900">Your Referral Code</CardTitle>
            <CardDescription>Share this code to refer customers and drivers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Code Display */}
            <div className="bg-white rounded-lg p-4 border-2 border-teal-200">
              <p className="text-sm text-gray-600 mb-2">Referral Code</p>
              <div className="flex items-center justify-between gap-3">
                <p className="text-2xl font-bold text-teal-600 font-mono tracking-wider">{myCode}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(myCode, 'code')}
                    className="flex items-center gap-1"
                  >
                    {codeCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Code
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(`My referral code is: ${myCode}`, 'message')}
                    className="flex items-center gap-1"
                  >
                    {messageCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy as Message
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Share URL Display */}
            {shareUrl && (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-600 mb-2">Share Link</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-mono text-gray-700 truncate">{shareUrl}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(shareUrl, 'url')}
                    className="flex items-center gap-2 flex-shrink-0"
                  >
                    {urlCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Referrals</CardTitle>
          <CardDescription>Customers and drivers you referred</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading referrals...</div>
          ) : referrals.length === 0 ? (
            <div className="text-sm text-muted-foreground">No referrals found</div>
          ) : (
            <div className="space-y-2">
              {referrals.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="text-sm font-medium">{r.refereeName || r.refereePhone || 'Referral'}</div>
                    <div className="text-xs text-muted-foreground">Status: {r.status}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
