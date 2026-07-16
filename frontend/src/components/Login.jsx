import { useState } from 'react';
import { Stethoscope, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/authSlice";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Field({ id, label, type = 'text', icon: Icon, value, onChange, error, placeholder, autoComplete }) {
    return (
        <div>
            <label htmlFor={id} className="block text-[13px] font-medium text-slate-700">
                {label}
            </label>
            <div className="relative mt-1.5">
                <Icon
                    className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                />
                <input
                    id={id}
                    name={id}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? `${id}-error` : undefined}
                    className={`block w-full rounded-xl border bg-white py-2.5 pl-11 pr-3.5 text-[14px] text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-4 focus:ring-primary-100 ${error
                        ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                        : 'border-slate-200 focus:border-primary-400'
                        }`}
                />
            </div>
            {error && (
                <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1 text-[12px] text-red-600">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {error}
                </p>
            )}
        </div>
    );
}

export default function Login({ onSubmit, onSwitchToSignup, loading = false }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const isLoading = loading || submitting;

    function validate() {
        const next = {};
        if (!email.trim()) next.email = 'Email is required';
        else if (!EMAIL_RE.test(email.trim())) next.email = 'Enter a valid email address';
        if (!password) next.password = 'Password is required';
        setErrors(next);
        return Object.keys(next).length === 0;
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (isLoading) return;
        if (!validate()) return;

        setSubmitting(true);

        try {
            const res = await fetch("http://127.0.0.1:8000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email.trim(),
                    password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setErrors({
                    email: data.detail,
                    password: data.detail,
                });
                return;
            }

            localStorage.setItem("token", data.access_token);
            localStorage.setItem("user", JSON.stringify({
                id: data.id,
                username: data.username,
                email: data.email,
            }));

            dispatch(
                setUser({
                    token: data.access_token,
                    user: {
                        id: data.id,
                        username: data.username,
                        email: data.email,
                    },
                })
            );

            navigate("/dashboard");

        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
            <div className="w-full max-w-sm animate-fade-in-up">
                <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-soft sm:p-8">
                    <div className="flex flex-col items-center text-center">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600 shadow-sm">
                            <Stethoscope className="h-6 w-6 text-white" aria-hidden="true" />
                        </div>
                        <h1 className="mt-4 text-[20px] font-semibold tracking-tight text-slate-900">
                            Welcome back
                        </h1>
                        <p className="mt-1 text-[13px] text-slate-500">Sign in to your MediSync account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
                        <Field
                            id="email"
                            label="Email"
                            type="email"
                            icon={Mail}
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                            }}
                            error={errors.email}
                            placeholder="you@hospital.com"
                            autoComplete="email"
                        />
                        <Field
                            id="password"
                            label="Password"
                            type="password"
                            icon={Lock}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                            }}
                            error={errors.password}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                        />

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-[13px] text-slate-500">
                        Don&rsquo;t have an account?{' '}
                        <Link
                            to="/signup"
                            className="font-semibold text-primary-600 transition hover:text-primary-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-200 rounded"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
