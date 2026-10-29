import VerifiedIcon from '../../assets/VerifiedIcon.jpg';
import { useState, useEffect, useRef } from "react";
import { AiOutlineCheckCircle } from "react-icons/ai";
import agent from '../../lib/api/agent';

const css = `
  @keyframes aadOvIn  { from { opacity:0 } to { opacity:1 } }
  @keyframes aadDlgIn {
    from { opacity:0; transform:translate(-50%,-47%) }
    to   { opacity:1; transform:translate(-50%,-50%) }
  }
  @keyframes aadSp { to { transform:rotate(360deg) } }

  .aad-overlay {
    position:fixed; z-index:99999; inset:0;
    background:rgba(7,17,35,.75);
    backdrop-filter:blur(3px);
    animation:aadOvIn .2s ease both;
  }
  .aad-dialog {
    position:absolute; top:50%; left:50%;
    transform:translate(-50%,-50%);
    background:#fff; border-radius:12px;
    width:520px; max-width:96vw; max-height:96vh;
    overflow-y:auto;
    box-shadow:0 24px 64px rgba(0,0,0,.45);
    animation:aadDlgIn .28s cubic-bezier(.34,1.35,.64,1) both;
  }
  .aad-hdr {
    background:linear-gradient(135deg,#0A1628,#1A4FA0);
    padding:14px 18px;
    display:flex; align-items:center; gap:11px;
    border-bottom:3px solid;
    border-image:linear-gradient(90deg,#FF6B00,#fff 50%,#138808) 1;
  }
  .aad-hdr-icon {
    width:36px; height:36px; flex-shrink:0;
    background:linear-gradient(135deg,#FF6B00,#FF9240);
    border-radius:9px; display:flex; align-items:center;
    justify-content:center; font-size:17px;
  }
  .aad-hdr-text h3 { font-size:.95rem; font-weight:700; color:#fff; margin:0; }
  .aad-hdr-text p  { font-size:.66rem; color:rgba(184,204,222,.8); margin:2px 0 0; }
  .aad-body { padding:16px 18px 18px; }

  .aad-sec {
    font-size:.63rem; font-weight:700; letter-spacing:.1em;
    text-transform:uppercase; color:#1A4FA0;
    margin:0 0 9px; display:flex; align-items:center; gap:8px;
  }
  .aad-sec::after {
    content:''; flex:1; height:1px;
    background:linear-gradient(90deg,rgba(26,79,160,.25),transparent);
  }
  .aad-g2 { display:grid; grid-template-columns:1fr 1fr; gap:9px; margin-bottom:11px; }
  .aad-g3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:9px; margin-bottom:11px; }
  .aad-fg  { display:flex; flex-direction:column; gap:3px; }
  .aad-fg-full { display:flex; flex-direction:column; gap:3px; margin-bottom:11px; }

  .aad-lbl { font-size:.68rem; color:#4a5a70; }
  .aad-lbl .req { color:#e05000; margin-left:2px; }

  .aad-inp {
    width:100%; padding:8px 10px; box-sizing:border-box;
    background:#f5f8fc; border:1.5px solid #dce4ef;
    border-radius:7px; font-size:.82rem; color:#1a2a42;
    outline:none; font-family:inherit;
    transition:border-color .18s,box-shadow .18s;
  }
  .aad-inp:focus  { border-color:#1A4FA0; box-shadow:0 0 0 2.5px rgba(26,79,160,.12); background:#fff; }
  .aad-inp.err    { border-color:#dc3545!important; background:#fff5f5; }
  .aad-inp.ok     { border-color:#1a9e55; }
  .aad-inp:disabled {
    background:#eef2f7; color:#6b7a90; cursor:not-allowed;
    border-color:#c8d4e4;
  }
  select.aad-inp option { background:#fff; color:#1a2a42; }

  .aad-dob-row { display:grid; grid-template-columns:1fr 1fr 1.3fr; gap:9px; }

  .aad-seg-row {
    display:grid; grid-template-columns:1fr 14px 1fr 14px 1fr;
    align-items:center; width:100%; box-sizing:border-box;
  }
  .aad-seg-inp {
    width:100%; min-width:0; padding:10px 4px; box-sizing:border-box;
    background:#f5f8fc; border:1.5px solid #dce4ef; border-radius:7px;
    font-family:'Courier New',monospace; font-size:.95rem; font-weight:700;
    text-align:center; letter-spacing:.15em; color:#1a2a42;
    outline:none; transition:border-color .18s;
  }
  .aad-seg-inp:focus { border-color:#1A4FA0; box-shadow:0 0 0 2.5px rgba(26,79,160,.12); }
  .aad-seg-inp.err   { border-color:#dc3545!important; background:#fff5f5; }
  .aad-seg-sep { color:#9aaabf; font-size:1rem; text-align:center; user-select:none; }
  .aad-seg-inp:disabled {
    background:#eef2f7; color:#6b7a90; cursor:not-allowed;
    border-color:#c8d4e4;
}

  .aad-err-txt { font-size:.67rem; color:#dc3545; margin-top:2px; min-height:14px; }

  .aad-info {
    background:#eef4ff; border:1px solid #c3d7f7; border-left:3px solid #1A4FA0;
    border-radius:7px; padding:8px 12px; font-size:.7rem; color:#3a5a8a;
    line-height:1.5; margin-bottom:13px; display:flex; gap:7px;
  }

  .aad-status {
    border-radius:7px; padding:9px 12px; font-size:.76rem;
    line-height:1.5; margin-bottom:12px; display:flex; gap:8px;
  }
  .aad-status.success { background:#edfaf2; border:1px solid #a8dfbf; color:#176340; }
  .aad-status.error   { background:#fff4f4; border:1px solid #f5b8b5; color:#9b2020; }

  .aad-btn-row { display:flex; gap:9px; }
  .aad-btn-verify {
    flex:1; padding:11px;
    background:linear-gradient(135deg,#FF6B00,#D05000);
    border:none; border-radius:8px; font-size:.85rem; font-weight:700;
    color:#fff; cursor:pointer; transition:opacity .2s,transform .15s;
    box-shadow:0 3px 12px rgba(255,107,0,.28);
  }
  .aad-btn-verify:hover    { opacity:.9; transform:translateY(-1px); }
  .aad-btn-verify:disabled { opacity:.5; cursor:not-allowed; transform:none; }

  .aad-spin {
    display:inline-block; width:13px; height:13px;
    border:2px solid rgba(255,255,255,.3); border-top-color:#fff;
    border-radius:50%; animation:aadSp .6s linear infinite;
    vertical-align:middle; margin-right:5px;
  }
  .aad-chip {
    display:inline-flex; align-items:center; gap:4px;
    background:#edfaf2; border:1px solid #7dd3a8; border-radius:20px;
    padding:3px 10px; font-size:.72rem; font-weight:700; color:#176340;
  }
  .aad-linked-note {
    font-size:.64rem; color:#1A4FA0; margin-top:2px;
    display:flex; align-items:center; gap:4px;
  }
    .aad-close {
  margin-left: auto;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255,255,255,0.15);
  color: #fff;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .2s ease;
}

.aad-close:hover {
  background: rgba(255,255,255,0.25);
  transform: scale(1.05);
}
`;

// ─── Helper ─────────────────────────────────────────────────────────────────
const GENDER_MAP_TO_MODAL = { M: "1", F: "2", T: "3", "1": "1", "2": "2", "3": "3" };
const GENDER_MAP_TO_FORM = { "1": "M", "2": "F", "3": "T" };

function nameToAadhaarFormat(name) {
    return (name || "").trim().toUpperCase();
}

// ─── Main Component ──────────────────────────────────────────────────────────
/**
 * AadhaarVerificationModal
 *
 * Props:
 *   isOpen         boolean   — controls visibility
 *   onClose        fn()      — called when modal should close
 *   onVerified     fn(data)  — called with verified data on success
 *   apiEndpoint    string    — URL for aadhaarVerification API
 *   formData       object    — { firstName, middleName, lastName, dob, gender, aadhaarNo }
 *   onFormSync     fn(data)  — called with {firstName,middleName,lastName,dob,gender} to lock main form
 */
export default function AadhaarVerificationModal({
    isOpen,
    onClose,
    onVerified,
    apiEndpoint,
    reverifyApiEndpoint,
    isReverify = false,  // NEW
    formData = {},
    onFormSync,
}) {
    // ── Local state ──────────────────────────────────────────────────────────
    const [fields, setFields] = useState({
        firstName: "", middleName: "", lastName: "",
        nameAsPerAadhaar: "",
        dobD: "", dobM: "", dobY: "",
        gender: "",
        seg1: "", seg2: "", seg3: "",
    });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState(null);   // null | {type,title,msg}
    const [verifying, setVerifying] = useState(false);
    const [verified, setVerified] = useState(false);

    const seg2Ref = useRef(null);
    const seg3Ref = useRef(null);
    const seg1Ref = useRef(null);
    const fNameRef = useRef(null);
    const initialFieldsRef = useRef(null);

    // ── Inject CSS once ──────────────────────────────────────────────────────
    useEffect(() => {
        const id = "aad-modal-css";
        if (!document.getElementById(id)) {
            const s = document.createElement("style");
            s.id = id; s.textContent = css;
            document.head.appendChild(s);
        }
    }, []);

    // ── Pre-fill when opened ─────────────────────────────────────────────────
    useEffect(() => {
        if (!isOpen) return;
        setVerified(false);
        setStatus(null);
        setErrors({});

        const getFullName = (firstName = "", middleName = "", lastName = "") =>
            [firstName, middleName, lastName]
                .filter(Boolean)
                .join(" ")
                .trim()
                .toUpperCase();

        const dob = formData.dob || "";
        let dobD = "", dobM = "", dobY = "";
        if (dob.includes("/")) {
            const p = dob.split("/");
            dobD = p[0] || ""; dobM = p[1] || ""; dobY = p[2] || "";
        }

        const aad = (formData.aadhaarNo || "").replace(/\D/g, "");
        const firstName = formData.firstName || "";

        const initial = {
            firstName,
            middleName: formData.middleName || "",
            lastName: formData.lastName || "",
            nameAsPerAadhaar: getFullName(
                formData.firstName,
                formData.middleName,
                formData.lastName
            ),
            dobD, dobM, dobY,
            gender: GENDER_MAP_TO_MODAL[formData.gender] || "",
            seg1: aad.slice(0, 4),
            seg2: aad.slice(4, 8),
            seg3: aad.slice(8, 12),
        };

        setFields(initial);
        initialFieldsRef.current = initial;   // NEW — snapshot for dirty-check

        setTimeout(() => fNameRef.current?.focus(), 220);
    }, [isOpen]);

    // ── Field change handler ─────────────────────────────────────────────────
    const set = (key, val) => {
        setFields(prev => {
            const next = { ...prev, [key]: val };

            if (
                key === "firstName" ||
                key === "middleName" ||
                key === "lastName"
            ) {
                next.nameAsPerAadhaar = [
                    next.firstName,
                    next.middleName,
                    next.lastName,
                ]
                    .filter(item => item && item.trim())
                    .join(" ")
                    .toUpperCase();
            }

            return next;
        });

        setErrors(prev => ({ ...prev, [key]: "" }));
    };
    // ── Aadhaar segment auto-jump ────────────────────────────────────────────
    const handleSeg = (key, val, nextRef) => {
        const digits = val.replace(/\D/g, "").slice(0, 4);
        set(key, digits);
        if (digits.length === 4 && nextRef?.current) nextRef.current.focus();
    };

    const handleSegKeyDown = (e, key, prevRef) => {
        if (e.key === "Backspace" && !fields[key] && prevRef?.current) {
            prevRef.current.focus();
        }
    };

    const handleSeg1Paste = (e) => {
        if (isReverify) return; // NEW — don't allow paste-overwrite during reverify
        e.preventDefault();
        const d = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 12);
        setFields(prev => ({
            ...prev,
            seg1: d.slice(0, 4),
            seg2: d.slice(4, 8),
            seg3: d.slice(8, 12),
        }));
        if (d.length >= 12) seg3Ref.current?.focus();
    };

    // ── Validation ───────────────────────────────────────────────────────────
    const validate = () => {
        const nameRx = /^[A-Za-z\s.''-]{1,50}$/;
        const newErr = {};

        if (!nameRx.test(fields.firstName.trim()))
            newErr.firstName = "Enter a valid first name.";
        if (!fields.nameAsPerAadhaar.trim())
            newErr.nameAsPerAadhaar = "Name as per Aadhaar is required.";

        const d = parseInt(fields.dobD), m = parseInt(fields.dobM),
            y = parseInt(fields.dobY);
        if (!fields.dobD || d < 1 || d > 31) newErr.dob = "Enter a valid date.";
        if (!fields.dobM || m < 1 || m > 12) newErr.dob = "Enter a valid month.";
        if (!fields.dobY || !/^\d{4}$/.test(fields.dobY) || y < 1900 || y > new Date().getFullYear())
            newErr.dob = "Enter a valid year.";
        if (!fields.gender) newErr.gender = "Please select gender.";

        const aad = fields.seg1 + fields.seg2 + fields.seg3;
        if (!/^\d{12}$/.test(aad) || aad[0] === "0" || aad[0] === "1")
            newErr.seg = "Enter a valid 12-digit Aadhaar number.";

        setErrors(newErr);
        return Object.keys(newErr).length === 0;
    };

    // ── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        setStatus(null);
        if (!validate()) return;

        const aad = fields.seg1 + fields.seg2 + fields.seg3;
        const dob = `${fields.dobD.padStart(2, "0")}/${fields.dobM.padStart(2, "0")}/${fields.dobY}`;

        setVerifying(true);

        // Separate endpoints again — fall back to apiEndpoint if reverifyApiEndpoint wasn't passed
        const targetEndpoint = isReverify && reverifyApiEndpoint
            ? reverifyApiEndpoint
            : apiEndpoint;

        try {
            const payload = {
                CandidateId: formData.candidateId || 0,
                FirstName: fields.firstName.trim().toUpperCase(),
                FatherName: fields.middleName.trim().toUpperCase(),
                LastName: fields.lastName.trim().toUpperCase(),
                Dob: dob,
                Gender: fields.gender,
                AadhaarNo: aad,
                UserLoginId: formData.userLoginID || "",
            };


            const response = await fetch(targetEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            // const data = await response.json();
            const verifyResult = data?.Data || data?.data;

            if (verifyResult?.IsVerified || verifyResult?.IsReVerified) {
                setStatus({
                    type: "success",
                    title: "✅ Verified",
                    msg: verifyResult?.Message || "Aadhaar verified successfully.",
                    ref: verifyResult?.ReferenceNo || "",
                });
                setVerified(true);

                const syncData = {
                    firstName: fields.firstName.trim().toUpperCase(),
                    middleName: fields.middleName.trim().toUpperCase(),
                    lastName: fields.lastName.trim().toUpperCase(),
                    dob,
                    gender: GENDER_MAP_TO_FORM[fields.gender] || fields.gender,
                    aadhaarNo: aad,
                    isReverified: isReverify,
                    reverifiedAt: isReverify ? new Date().toISOString() : null,
                    referenceNo: verifyResult?.ReferenceNo || "",
                };
                onFormSync?.(syncData);
                onVerified?.(syncData);

                setTimeout(() => onClose?.(), 1600);
            } else {
                setStatus({
                    type: "error",
                    title: "❌ Verification Failed",
                    msg: data?.Message || data?.message || "Details do not match. Please check and retry.",
                });
            }
        } catch {
            setStatus({
                type: "error",
                title: "❌ Error",
                msg: "Could not reach Aadhaar service. Please try again.",
            });
        } finally {
            setVerifying(false);
        }
    };

    if (!isOpen) return null;
    const isUnchangedForReverify =
        isReverify &&
        initialFieldsRef.current &&
        Object.keys(initialFieldsRef.current).every(
            (key) => fields[key] === initialFieldsRef.current[key]
        );

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="aad-overlay" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
            <div className="aad-dialog" role="dialog" aria-modal="true"
                aria-label="Aadhaar Identity Verification">

                {/* Header */}
                <div className="aad-hdr">
                    <div className="aad-hdr-icon">🔐</div>

                    <div className="aad-hdr-text">
                        <h3>{isReverify ? "Reverify Aadhaar" : "Aadhaar Identity Verification"}</h3>
                        <p>
                            {isReverify
                                ? "Your Aadhaar number is locked — confirm your details to reverify."
                                : "Confirm your details and enter Aadhaar number to verify."}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="aad-close"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <div className="aad-body">

                    {/* ── Name Details ──────────────────────────────────────────── */}
                    <div className="aad-sec">Name Details</div>
                    <div className="aad-g2">
                        <div className="aad-fg">
                            <span className="aad-lbl">
                                First Name <span className="req">*</span>
                            </span>
                            <input
                                ref={fNameRef}
                                type="text"
                                className={`aad-inp${errors.firstName ? " err" : fields.firstName ? " ok" : ""}`}
                                placeholder="First name"
                                maxLength={50}
                                value={fields.firstName}
                                onChange={e => set("firstName", e.target.value.toUpperCase())}
                                autoComplete="off"
                            />
                            {errors.firstName && (
                                <div className="aad-err-txt">{errors.firstName}</div>
                            )}
                        </div>
                        <div className="aad-fg">
                            <span className="aad-lbl">Middle Name</span>
                            <input
                                type="text"
                                className="aad-inp"
                                placeholder="Middle name"
                                maxLength={50}
                                value={fields.middleName}
                                onChange={e => set("middleName", e.target.value.toUpperCase())}
                                autoComplete="off"
                            />
                        </div>
                    </div>
                    <div className="aad-g2" style={{ marginBottom: 4 }}>
                        <div className="aad-fg">
                            <span className="aad-lbl">Last Name</span>
                            <input
                                type="text"
                                className="aad-inp"
                                placeholder="Last name"
                                maxLength={50}
                                value={fields.lastName}
                                onChange={e => set("lastName", e.target.value.toUpperCase())}
                                autoComplete="off"
                            />
                        </div>
                    </div>

                    {/* ── Name as per Aadhaar (NEW FIELD) ──────────────────────── */}
                    <div className="aad-fg-full">
                        <span className="aad-lbl">
                            Name as per Aadhaar <span className="req">*</span>
                        </span>
                        <input
                            type="text"
                            className={`aad-inp${errors.nameAsPerAadhaar ? " err" : fields.nameAsPerAadhaar ? " ok" : ""}`}
                            placeholder="Name exactly as printed on Aadhaar card"
                            maxLength={100}
                            value={fields.nameAsPerAadhaar}
                            onChange={e => {
                                setFields(prev => ({ ...prev, nameAsPerAadhaar: e.target.value.toUpperCase() }));
                                setErrors(prev => ({ ...prev, nameAsPerAadhaar: "" }));
                            }}
                            autoComplete="off"
                        />
                        {/* Linked indicator */}
                        {/* <div className="aad-linked-note">
              🔗&nbsp;
              {fields.nameAsPerAadhaar === nameToAadhaarFormat(fields.firstName)
                ? <span>Auto-filled from First Name — edit if different on card.</span>
                : <span style={{ color: "#e05000" }}>
                    Differs from First Name ({nameToAadhaarFormat(fields.firstName) || "—"}) — using Aadhaar card value.
                  </span>
              }
            </div> */}
                        {errors.nameAsPerAadhaar && (
                            <div className="aad-err-txt">{errors.nameAsPerAadhaar}</div>
                        )}
                    </div>

                    {/* ── DOB + Gender ──────────────────────────────────────────── */}
                    <div className="aad-sec">Date of Birth &amp; Gender</div>
                    <div className="aad-g2" style={{ marginBottom: 4 }}>
                        <div className="aad-fg">
                            <span className="aad-lbl">
                                Date of Birth <span className="req">*</span>
                            </span>
                            <div className="aad-dob-row">
                                <input
                                    type="text"
                                    className={`aad-inp${errors.dob ? " err" : ""}`}
                                    placeholder="DD"
                                    maxLength={2}
                                    inputMode="numeric"
                                    value={fields.dobD}
                                    onChange={e => set("dobD", e.target.value.replace(/\D/g, ""))}
                                    autoComplete="off"
                                />
                                <input
                                    type="text"
                                    className={`aad-inp${errors.dob ? " err" : ""}`}
                                    placeholder="MM"
                                    maxLength={2}
                                    inputMode="numeric"
                                    value={fields.dobM}
                                    onChange={e => set("dobM", e.target.value.replace(/\D/g, ""))}
                                    autoComplete="off"
                                />
                                <input
                                    type="text"
                                    className={`aad-inp${errors.dob ? " err" : ""}`}
                                    placeholder="YYYY"
                                    maxLength={4}
                                    inputMode="numeric"
                                    value={fields.dobY}
                                    onChange={e => set("dobY", e.target.value.replace(/\D/g, ""))}
                                    autoComplete="off"
                                />
                            </div>
                            {errors.dob && <div className="aad-err-txt">{errors.dob}</div>}
                        </div>

                        <div className="aad-fg">
                            <span className="aad-lbl">
                                Gender <span className="req">*</span>
                            </span>
                            <select
                                className={`aad-inp${errors.gender ? " err" : fields.gender ? " ok" : ""}`}
                                value={fields.gender}
                                onChange={e => set("gender", e.target.value)}
                            >
                                <option value="">— Select —</option>
                                <option value="1">Male</option>
                                <option value="2">Female</option>
                                <option value="3">Transgender / Other</option>
                            </select>
                            {errors.gender && <div className="aad-err-txt">{errors.gender}</div>}
                        </div>
                    </div>

                    {/* ── Aadhaar Number ────────────────────────────────────────── */}
                    <div className="aad-sec" style={{ marginTop: 8 }}>Aadhaar Number</div>
                    <div className="aad-fg" style={{ marginBottom: 11 }}>
                        <span className="aad-lbl">
                            12-Digit Aadhaar <span className="req">*</span>
                        </span>
                        <div className="aad-seg-row" style={{ marginTop: 4 }}>
                            <input
                                ref={seg1Ref}
                                type="text"
                                className={`aad-seg-inp${errors.seg ? " err" : ""}`}
                                placeholder="XXXX"
                                maxLength={4}
                                inputMode="numeric"
                                value={fields.seg1}
                                disabled={isReverify}
                                onChange={e => handleSeg("seg1", e.target.value, seg2Ref)}
                                onPaste={handleSeg1Paste}
                                autoComplete="off"
                            />
                            <span className="aad-seg-sep">—</span>
                            <input
                                ref={seg2Ref}
                                type="text"
                                className={`aad-seg-inp${errors.seg ? " err" : ""}`}
                                placeholder="XXXX"
                                maxLength={4}
                                inputMode="numeric"
                                value={fields.seg2}
                                disabled={isReverify}
                                onChange={e => handleSeg("seg2", e.target.value, seg3Ref)}
                                onKeyDown={e => handleSegKeyDown(e, "seg2", seg1Ref)}
                                autoComplete="off"
                            />
                            <span className="aad-seg-sep">—</span>
                            <input
                                ref={seg3Ref}
                                type="text"
                                className={`aad-seg-inp${errors.seg ? " err" : ""}`}
                                placeholder="XXXX"
                                maxLength={4}
                                inputMode="numeric"
                                value={fields.seg3}
                                disabled={isReverify}
                                onChange={e => handleSeg("seg3", e.target.value, null)}
                                onKeyDown={e => handleSegKeyDown(e, "seg3", seg2Ref)}
                                autoComplete="off"
                            />
                        </div>
                        {errors.seg && <div className="aad-err-txt">{errors.seg}</div>}
                    </div>

                    {/* Info banner */}
                    <div className="aad-info">
                        🔒&nbsp;
                        <span>
                            Aadhaar is encrypted before transmission. Verified via MSBSVET API.
                            No data stored.
                        </span>
                    </div>

                    {/* Status */}
                    {status && (
                        <div className={`aad-status ${status.type}`}>
                            <span style={{ fontSize: "1rem", flexShrink: 0 }}>
                                {status.type === "success" ? "✅" : "❌"}
                            </span>
                            <div>
                                <strong>{status.title}</strong>
                                <br />
                                <span style={{ fontSize: ".72rem" }}>
                                    {status.msg}
                                    {status.ref ? ` · Ref: ${status.ref}` : ""}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Verified chip */}
                    {verified && (
                        <div style={{ marginBottom: 12 }}>
                            <span className="aad-chip">
                                <AiOutlineCheckCircle /> Aadhaar Verified
                            </span>
                        </div>
                    )}

                    {/* Verify button */}
                    <div className="aad-btn-row">
                        <button
                            type="button"
                            className="aad-btn-verify"
                            onClick={handleSubmit}
                            disabled={verifying || verified || isUnchangedForReverify}
                        >
                            {verifying ? (
                                <>
                                    <span className="aad-spin" />
                                    {isReverify ? "Reverifying..." : "Verifying..."}
                                </>
                            ) : verified ? (
                                <img src={VerifiedIcon} alt="Verified" style={{ height: "28px", width: "auto", verticalAlign: "middle" }} />
                            ) : (
                                isReverify ? "🔄 Reverify Aadhaar" : "🔐 Verify Aadhaar"
                            )}
                        </button>
                    </div>
                    {isUnchangedForReverify && (
                        <div className="aad-err-txt" style={{ textAlign: "center", marginTop: 6 }}>
                            Change at least one detail above to reverify.
                        </div>
                    )}

                </div>{/* /aad-body */}
            </div>{/* /aad-dialog */}
        </div>
    );
}