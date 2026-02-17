import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

interface PayPalButtonProps {
    readonly amount: string;
    readonly onSuccess: (details: any) => void;
}

export default function PayPalButton({ amount, onSuccess }: PayPalButtonProps) {
    return (
        <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test" }}>
            <PayPalButtons
                style={{ layout: "horizontal" }}
                createOrder={(data, actions) => {
                    return actions.order.create({
                        intent: "CAPTURE",
                        purchase_units: [
                            {
                                amount: {
                                    currency_code: "USD",
                                    value: amount,
                                },
                            },
                        ],
                    });
                }}
                onApprove={(data, actions) => {
                    return actions.order!.capture().then((details) => {
                        onSuccess(details);
                    });
                }}
            />
        </PayPalScriptProvider>
    );
}
