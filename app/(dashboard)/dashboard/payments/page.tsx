"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Calendar, Lock } from "lucide-react";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";

interface PaymentMethod {
  id: string;
  type: 'visa' | 'mastercard';
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
}

const STATIC_CARD: PaymentMethod = {
  id: 'static-1',
  type: 'visa',
  last4: '4242',
  expiryMonth: '12',
  expiryYear: '24',
  isDefault: true
};

export default function PaymentsPage() {
  const { data: session, status } = useSession();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'authenticated') {
      fetchPaymentMethods();
    } else {
      setPaymentMethods([STATIC_CARD]);
      setIsLoading(false);
    }
  }, [status, session]);

  const fetchPaymentMethods = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/payment-methods');
      if (!response.ok) throw new Error('Failed to fetch payment methods');
      const data = await response.json();
      setPaymentMethods(data.length === 0 ? [STATIC_CARD] : data);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      setPaymentMethods([STATIC_CARD]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Here you would typically integrate with a payment processor like Stripe
      // For now, we'll just store the last 4 digits
      const last4 = cardNumber.slice(-4);
      const type = cardNumber.startsWith('4') ? 'visa' : 'mastercard';

      const response = await fetch('/api/payment-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          last4,
          expiryMonth,
          expiryYear,
          isDefault: paymentMethods.length === 0, // Set as default if it's the first card
        }),
      });

      if (!response.ok) throw new Error('Failed to add card');

      toast.success('Card added successfully');
      setShowAddCard(false);
      fetchPaymentMethods();

      // Reset form
      setCardNumber('');
      setCardName('');
      setExpiryMonth('');
      setExpiryYear('');
      setCvv('');
    } catch (error) {
      console.error('Error adding card:', error);
      toast.error('Failed to add card');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    // Don't allow changing default for static card
    if (id === STATIC_CARD.id) {
      toast.error('Cannot modify static card');
      return;
    }

    try {
      const response = await fetch(`/api/payment-methods/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isDefault: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to update default card');

      toast.success('Default payment method updated');
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error updating default card:', error);
      toast.error('Failed to update default card');
    }
  };

  const handleDeleteCard = async (id: string) => {
    // Don't allow deleting static card
    if (id === STATIC_CARD.id) {
      toast.error('Cannot delete static card');
      return;
    }

    try {
      const response = await fetch(`/api/payment-methods/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete card');

      toast.success('Card removed successfully');
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error deleting card:', error);
      toast.error('Failed to delete card');
    }
  };

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Payment Methods</h1>
        <Button onClick={() => setShowAddCard(true)}>Add New Card</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Existing Cards */}
        <Card>
          <CardHeader>
            <CardTitle>Saved Cards</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 rounded">
                        <CreditCard className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {method.type === 'visa' ? 'Visa' : 'Mastercard'} ending in {method.last4}
                        </p>
                        <p className="text-sm text-gray-500">
                          Expires {method.expiryMonth}/{method.expiryYear}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!method.isDefault && method.id !== STATIC_CARD.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(method.id)}
                        >
                          Set as Default
                        </Button>
                      )}
                      {method.id !== STATIC_CARD.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCard(method.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add New Card Form */}
        {showAddCard && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Card</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCard} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <div className="relative">
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      maxLength={19}
                    />
                    <CreditCard className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input
                    id="cardName"
                    placeholder="John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Expiry Date</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Select value={expiryMonth} onValueChange={setExpiryMonth}>
                        <SelectTrigger>
                          <SelectValue placeholder="MM" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                              {(i + 1).toString().padStart(2, '0')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={expiryYear} onValueChange={setExpiryYear}>
                        <SelectTrigger>
                          <SelectValue placeholder="YY" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => (
                            <SelectItem key={i} value={(new Date().getFullYear() + i).toString().slice(-2)}>
                              {(new Date().getFullYear() + i).toString().slice(-2)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <div className="relative">
                      <Input
                        id="cvv"
                        type="password"
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        maxLength={4}
                      />
                      <Lock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddCard(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Adding..." : "Add Card"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 