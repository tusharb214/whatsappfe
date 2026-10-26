import api from "./axios";

export interface SubscriptionPlan {
    id: number;
    name: string;
    description: string | null;
    durationDays: number;
    price: number;
    currency: string;
    features: string | null;
    instructions: string | null;
    imageUrl: string | null;
    allowOnline: boolean;
    allowCash: boolean;
    active: boolean;
    sortOrder: number;
}

export interface PlanInput {
    name: string;
    description: string;
    durationDays: number;
    price: number;
    currency: string;
    features: string;
    instructions: string;
    imageUrl: string;
    allowOnline: boolean;
    allowCash: boolean;
    active: boolean;
    sortOrder: number;
}

export const getPlans = async (): Promise<SubscriptionPlan[]> =>
    (await api.get<SubscriptionPlan[]>("/subscription-plans")).data;

export const createPlan = async (input: PlanInput): Promise<SubscriptionPlan> =>
    (await api.post<SubscriptionPlan>("/subscription-plans", input)).data;

export const updatePlan = async (
    id: number,
    input: PlanInput
): Promise<SubscriptionPlan> =>
    (await api.put<SubscriptionPlan>(`/subscription-plans/${id}`, input)).data;

export const deletePlan = async (id: number): Promise<void> => {
    await api.delete(`/subscription-plans/${id}`);
};

const toJpegBlob = async (file: File): Promise<Blob> => {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return new Promise((resolve, reject) =>
        canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error("Convert failed"))),
            "image/jpeg",
            0.85
        )
    );
};

export const uploadPlanImage = async (file: File): Promise<string> => {
    const jpeg = await toJpegBlob(file);
    const form = new FormData();
    form.append("file", jpeg, "image.jpg");
    const response = await api.post("/assets/image", form, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return String(response.data.url);
};

export interface RuleInput {
    appliesTo: "ANY" | "CATEGORY" | "PRODUCT";
    targetId: number | null;
    quantity: number;
    period: "DAY" | "WEEK" | "PLAN";
}

export const getRules = async (planId: number): Promise<RuleInput[]> =>
    (await api.get<RuleInput[]>(`/subscription-plans/${planId}/rules`)).data;

export const saveRules = async (
    planId: number,
    rules: RuleInput[]
): Promise<void> => {
    await api.put(`/subscription-plans/${planId}/rules`, rules);
};
