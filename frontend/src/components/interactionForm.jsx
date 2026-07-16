import { User, Activity, MessageCircle, Flag, Save, Check } from 'lucide-react';
import { useDispatch, useSelector } from "react-redux";
import { setField } from '../redux/interactionSlice';

const INTERACTION_TYPES = ['In Person', 'Virtual Meeting', 'Phone Call', 'Conference', 'Email'];
const SPECIALTIES = ['Cardiology', 'Oncology', 'Neurology', 'Endocrinology', 'Pediatrics', 'Psychiatry', 'Dermatology'];
const SENTIMENTS = ['Positive', 'Neutral', 'Skeptical', 'Negative'];

const SENTIMENT_COLORS = {
    Positive: 'bg-teal-50 text-teal-700 border-teal-200',
    Neutral: 'bg-slate-50 text-slate-600 border-slate-200',
    Skeptical: 'bg-amber-50 text-amber-700 border-amber-200',
    Negative: 'bg-rose-50 text-rose-700 border-rose-200',
};




function Field({ label, children, filled }) {

    return (
        <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-600">
                {label}
                {filled && (
                    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-teal-100" title="AI-filled">
                        <Check className="h-2 w-2 text-teal-600" strokeWidth={3.5} />
                    </span>
                )}
            </label>
            {children}
        </div>
    );
}

const inputClass = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[14px] text-slate-700 placeholder:text-slate-300 outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-100';

function SectionHeader({ icon: Icon, title }) {
    return (
        <div className="flex items-center gap-2 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50">
                <Icon className="h-4 w-4 text-primary-600" strokeWidth={2} />
            </div>
            <h3 className="text-[14px] font-bold text-slate-800">{title}</h3>
        </div>
    );
}

export default function InteractionForm({ onChange, onSave, saved }) {
    const dispatch = useDispatch();
    const interaction = useSelector((state) => state.interaction);
    console.log(interaction)
    const isFilled = (v) => v.trim().length > 0;

    const handleSubmit = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/interactions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    hcp_name: interaction.hcpName,
                    interaction_type: interaction.interactionType,
                    hospital: interaction.hospital,
                    specialty: interaction.specialty,
                    date: interaction.date,
                    time: interaction.time,
                    attendees: interaction.attendees,
                    topics_discussed: interaction.topics,
                    materials_shared: interaction.materialsShared,
                    samples_distributed: interaction.samplesDistributed,
                    sentiment: interaction.sentiment,
                    outcomes: interaction.outcomes,
                    follow_up: interaction.followUp,
                    follow_up_date: interaction.followUpDate,
                }),
            });

            const data = await response.json();
            console.log(data);
            onSave()
        } catch (error) {
            console.error("Save error:", error);
        }
    };

    return (
        <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div>
                    <h2 className="text-[15px] font-bold text-slate-900">Interaction Details</h2>
                    <p className="text-[12px] text-slate-400">Fields auto-fill from AI · Editable</p>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 border border-teal-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse-soft" />
                    <span className="text-[12px] font-semibold text-teal-700">AI-assisted</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5 space-y-6">
                {/* HCP Information */}
                <section>
                    <SectionHeader icon={User} title="HCP Information" />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="HCP Name" filled={isFilled(interaction.hcpName)}>
                            <input className={inputClass} value={interaction.hcpName}
                                onChange={(e) =>
                                    dispatch(setField({
                                        field: "hcpName",
                                        value: e.target.value,
                                    }))
                                } placeholder="e.g. Dr. Sarah Chen" />
                        </Field>
                        <Field label="Hospital" >
                            <input className={inputClass} value={interaction.hospital} onChange={(e) =>

                                dispatch(
                                    setField({
                                        field: "hospital",
                                        value: e.target.value,
                                    })
                                )
                            } placeholder="e.g. Mass General Hospital" />
                        </Field>
                        <Field label="date">
                            <select
                                className={inputClass}
                                value={interaction.specialty}
                                onChange={(e) =>
                                    dispatch(
                                        setField({
                                            field: "specialty",
                                            value: e.target.value,
                                        })
                                    )
                                }
                            >
                                <option value="">Select specialty...</option>
                                {SPECIALTIES.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </Field>
                    </div>
                </section>

                <div className="border-t border-slate-100" />

                {/* Interaction Details */}
                <section>
                    <SectionHeader icon={Activity} title="Interaction Details" />
                    <div className="flex gap-4 flex-col">
                        <Field label="Interaction Type">
                            <select
                                className={inputClass}
                                value={interaction.interactionType}
                                onChange={(e) =>
                                    dispatch(
                                        setField({
                                            field: "interactionType",
                                            value: e.target.value,
                                        })
                                    )
                                }
                            >
                                <option value="">Select type...</option>
                                {INTERACTION_TYPES.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Date" >
                                <input type="date" className={inputClass} value={interaction.date}
                                    onChange={(e) =>
                                        dispatch(setField({
                                            field: "date",
                                            value: e.target.value,
                                        }))
                                    } />
                            </Field>
                            <Field label="Time" filled={isFilled(interaction.time)}>
                                <input type="time" className={inputClass} value={interaction.time} onChange={(e) =>
                                    dispatch(setField({
                                        field: "time",
                                        value: e.target.value,
                                    }))
                                } />
                            </Field>
                        </div>
                        <div className="sm:col-span-2">
                            <Field label="Attendees" filled={isFilled(interaction.attendees)}>
                                <input className={inputClass} value={interaction.attendees}
                                    onChange={(e) =>
                                        dispatch(setField({
                                            field: "hcpName",
                                            value: e.target.value,
                                        }))
                                    } placeholder="Comma-separated list" />
                            </Field>
                        </div>
                    </div>
                </section>

                <div className="border-t border-slate-100" />

                {/* Discussion */}
                <section>
                    <SectionHeader icon={MessageCircle} title="Discussion" />
                    <div className="grid grid-cols-1 gap-4">
                        <Field label="Topics Discussed" filled={isFilled(interaction.topics)}>
                            <input className={inputClass} value={interaction.topics}
                                onChange={(e) =>
                                    dispatch(setField({
                                        field: "hcpName",
                                        value: e.target.value,
                                    }))
                                } placeholder="Comma-separated topics" />
                        </Field>
                        <Field label="Materials Shared">
                            <input className={inputClass}
                                value={interaction.materialsShared}
                                onChange={(e) =>
                                    dispatch(setField({
                                        field: "materialsshared",
                                        value: e.target.value,
                                    }))
                                } placeholder="Brochures, reprints, etc." />
                        </Field>
                        <Field label="Samples Distributed" >
                            <input className={inputClass} value={interaction.samplesDistributed}
                                onChange={(e) =>
                                    dispatch(setField({
                                        field: "samplesDistributed",
                                        value: e.target.value,
                                    }))
                                } placeholder="Product name, dosage, quantity" />
                        </Field>
                    </div>
                </section>

                <div className="border-t border-slate-100" />

                {/* Outcome */}
                <section>
                    <SectionHeader icon={Flag} title="Outcome" />
                    <div className="grid grid-cols-1 gap-4">
                        <Field label="Sentiment">
                            <div className="flex flex-wrap gap-2">
                                {SENTIMENTS.map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() =>
                                            dispatch(
                                                setField({
                                                    field: "sentiment",
                                                    value: s,
                                                })
                                            )
                                        }
                                        className={`rounded-lg border px-3 py-1.5 text-[13px] font-medium transition ${interaction.sentiment === s
                                            ? SENTIMENT_COLORS[s] + " ring-2 ring-offset-1 ring-current"
                                            : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </Field>
                        <Field label="Outcomes" >
                            <textarea rows={2} className={inputClass + ' resize-none'} value={interaction.outcomes}
                                onChange={(e) =>
                                    dispatch(setField({
                                        field: "hcpName",
                                        value: e.target.value,
                                    }))
                                } placeholder="Summary of interaction outcome..." />
                        </Field>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Field label="Follow-up" >
                                <input className={inputClass} value={interaction.followUp}
                                    onChange={(e) =>
                                        dispatch(setField({ field: "followUp", value: e.target.value }))
                                    } placeholder="Next action..." />
                            </Field>
                            <Field label="Follow-up Date" >
                                <input type="date" className={inputClass} value={interaction.followUpDate}
                                    onChange={(e) =>
                                        dispatch(setField({ field: "followUpDate", value: e.target.value }))
                                    } />
                            </Field>
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 px-6 py-4 bg-slate-50/50">
                <button
                    onClick={handleSubmit}
                    disabled={saved}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[15px] font-semibold transition ${saved
                        ? 'bg-teal-600 text-white cursor-default'
                        : 'bg-primary-600 text-black hover:bg-primary-700 shadow-md hover:shadow-lg'
                        }`}
                >
                    {saved ? (
                        <><Check className="h-5 w-5" strokeWidth={2.5} /> Interaction Saved</>
                    ) : (
                        <><Save className="h-5 w-5" strokeWidth={2} /> Save Interaction</>
                    )}
                </button>
            </div>
        </div>
    );
}