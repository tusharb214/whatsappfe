import { useRef, useState } from "react";
import api from "../api/axios";

type Props = {
    value: string;
    onChange: (url: string) => void;
};

async function toJpeg(file: File): Promise<Blob> {
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
}

export default function ImageUpload({ value, onChange }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const handleFile = async (file: File | undefined) => {
        if (!file) return;
        setBusy(true);
        setError("");
        try {
            const jpeg = await toJpeg(file);
            const form = new FormData();
            form.append("file", jpeg, "image.jpg");
            const res = await api.post("/assets/image", form, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            onChange(res.data.url);
        } catch (e) {
            console.error(e);
            setError("Upload failed. Try another image.");
        } finally {
            setBusy(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-2">
            {value && (
                <img
                    src={value}
                    alt="Preview"
                    className="h-24 w-24 rounded-lg border object-cover"
                />
            )}
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    disabled={busy}
                    onClick={() => inputRef.current?.click()}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                    {busy ? "Uploading..." : value ? "Change image" : "Upload image"}
                </button>
                {value && (
                    <button
                        type="button"
                        onClick={() => onChange("")}
                        className="text-xs text-red-600"
                    >
                        Remove
                    </button>
                )}
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
            />
        </div>
    );
}
