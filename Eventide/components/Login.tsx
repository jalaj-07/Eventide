import React, { useState, useEffect } from "react";
import { UserRole, User, VendorKYC, PlannerKYC } from "../types";
import {
  Briefcase,
  Calendar,
  ArrowLeft,
  Loader2,
  Lock,
  Mail,
  BadgeCheck,
  Hash,
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Globe,
  User as UserIcon,
  Eye,
  EyeOff,
  FileText,
  Building,
  MapPin,
  CreditCard,
  Upload,
} from "lucide-react";
import { Backend } from "../services/backend";
import { useToast } from "./ToastContext";
import { useLocation } from "react-router-dom";

interface LoginProps {
  onLogin: (user: User) => void;
}

type ViewState =
  | "role-selection"
  | "login"
  | "signup"
  | "forgot-password"
  | "kyc-verification";

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [viewState, setViewState] = useState<ViewState>("role-selection");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const { addToast } = useToast();
  const location = useLocation();

  // Login/Signup Form State
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [secret, setSecret] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Validation State
  const [errors, setErrors] = useState<{
    identifier?: string;
    secret?: string;
    name?: string;
    general?: string;
  }>({});

  // Forgot Password State
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryStatus, setRecoveryStatus] = useState<
    "idle" | "sending" | "sent"
  >("idle");

  // KYC Multi-Step State
  const [kycStep, setKycStep] = useState(0);
  const [vendorKyc, setVendorKyc] = useState<Partial<VendorKYC>>({
    termsAccepted: false,
    platformCommissionAccepted: false,
  });
  const [plannerKyc, setPlannerKyc] = useState<Partial<PlannerKYC>>({
    termsAccepted: false,
    serviceLevelAgreementAccepted: false,
    paymentRulesAccepted: false,
    noCriminalRecordDeclared: false,
    isAgency: false,
  });

  useEffect(() => {
    // Handle navigation from other pages (e.g., Join as Vendor)
    if (location.state) {
      const { role, mode } = location.state;
      if (role) setSelectedRole(role);
      if (mode === "signup") setViewState("signup");
      else if (mode === "login") setViewState("login");
    }
  }, [location]);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    let isValid = true;

    // Identifier Validation
    if (!identifier.trim()) {
      newErrors.identifier = "This field is required";
      isValid = false;
    } else if (
      selectedRole === UserRole.CLIENT &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)
    ) {
      newErrors.identifier = "Please enter a valid email address";
      isValid = false;
    }

    // Password Validation
    if (!secret) {
      newErrors.secret = "Password is required";
      isValid = false;
    } else if (viewState === "signup" && secret.length < 6) {
      newErrors.secret = "Password must be at least 6 characters";
      isValid = false;
    }

    // Name Validation (Signup only)
    if (viewState === "signup" && !name.trim()) {
      newErrors.name = "Full Name is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setViewState("login");
    setErrors({});
    setIdentifier("");
    setSecret("");
    setName("");
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    if (!validateForm()) {
      addToast("Please fix the errors in the form", "error");
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      let user;
      if (viewState === "signup") {
        // Register logic
        user = await Backend.Auth.register({
          name,
          email: identifier,
          password: secret,
          role: selectedRole,
          ...(selectedRole !== UserRole.CLIENT && {
            providerProfile: {
              providerId: "", // Backend will set this
              businessName:
                selectedRole === UserRole.VENDOR
                  ? vendorKyc.businessName
                  : plannerKyc.agencyName || plannerKyc.ownerName,
              businessDescription:
                selectedRole === UserRole.VENDOR
                  ? vendorKyc.description || `Service Area: ${vendorKyc.serviceArea}`
                  : `Planner in ${plannerKyc.city}`,
              providerType:
                selectedRole === UserRole.VENDOR ? "VENDOR" : "PLANNER",
              verified: true, // KYC passed
              kycData:
                selectedRole === UserRole.VENDOR
                  ? (vendorKyc as VendorKYC)
                  : (plannerKyc as PlannerKYC),
            },
          }),
        });
        addToast("Account created successfully!", "success");
      } else {
        // Login logic
        user = await Backend.Auth.login(selectedRole, identifier, secret);
      }
      onLogin(user);
    } catch (err: any) {
      setErrors({ general: err.message || "Authentication failed" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoverPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) {
      addToast("Please enter your email", "error");
      return;
    }

    setRecoveryStatus("sending");
    try {
      await Backend.Auth.recoverPassword(recoveryEmail);
      setRecoveryStatus("sent");
    } catch (err) {
      setRecoveryStatus("sent");
    }
  };

  // --- KYC Logic ---

  const KYC_STEPS = ["Basic Info", "Legal & Identity", "Banking", "Policies"];

  const validateKYCStep = (step: number) => {
    if (selectedRole === UserRole.VENDOR) {
      switch (step) {
        case 0:
          return (
            vendorKyc.businessName &&
            vendorKyc.mobile &&
            vendorKyc.email &&
            vendorKyc.city &&
            vendorKyc.city &&
            vendorKyc.serviceArea &&
            vendorKyc.description
          );
        case 1:
          return vendorKyc.panCardNo && vendorKyc.businessRegistrationNo && vendorKyc.aadharCardNo;
        case 2:
          return (
            vendorKyc.accountNumber &&
            vendorKyc.accountHolderName &&
            vendorKyc.ifscCode &&
            vendorKyc.cancelledChequeUrl
          );
        case 3:
          return (
            vendorKyc.termsAccepted &&
            vendorKyc.platformCommissionAccepted &&
            vendorKyc.cancellationPolicy
          );
        default:
          return false;
      }
    } else if (selectedRole === UserRole.PLANNER) {
      switch (step) {
        case 0:
          return (
            (plannerKyc.isAgency ? plannerKyc.agencyName : plannerKyc.ownerName) &&
            plannerKyc.mobile &&
            plannerKyc.email &&
            plannerKyc.city &&
            plannerKyc.serviceLocations &&
            plannerKyc.yearsExperience
          );
        case 1:
          const agencyCheck = plannerKyc.isAgency
            ? plannerKyc.businessRegistrationNo && plannerKyc.coreTeamIdUrl
            : true;
          return (
            plannerKyc.panCardNo &&
            plannerKyc.aadharCardNo &&
            plannerKyc.gstNo &&
            plannerKyc.policeVerificationUrl &&
            plannerKyc.noCriminalRecordDeclared &&
            agencyCheck
          );
        case 2:
          return (
            plannerKyc.accountNumber &&
            plannerKyc.accountHolderName &&
            plannerKyc.ifscCode &&
            plannerKyc.cancelledChequeUrl
          );
        case 3:
          return (
            plannerKyc.termsAccepted &&
            plannerKyc.serviceLevelAgreementAccepted &&
            plannerKyc.paymentRulesAccepted &&
            plannerKyc.cancellationPolicy
          );
        default:
          return false;
      }
    }
    return false;
  };

  const handleNextKYCStep = () => {
    if (validateKYCStep(kycStep)) {
      setKycStep((prev) => prev + 1);
    } else {
      addToast("Please fill all required fields correctly.", "error");
    }
  };

  const handleKYCComplete = () => {
    if (!validateKYCStep(3)) {
      addToast("Please accept all terms and policies.", "error");
      return;
    }
    setIsLoading(true);
    // Simulate verification delay
    setTimeout(() => {
      setIsLoading(false);
      addToast(
        "Verification Successful! Redirecting to account creation...",
        "success"
      );
      // Pre-fill auth name and email from KYC data
      if (selectedRole === UserRole.VENDOR) {
        setName(vendorKyc.businessName || "");
        setIdentifier(vendorKyc.email || "");
      } else {
        setName(plannerKyc.ownerName || plannerKyc.agencyName || "");
        setIdentifier(plannerKyc.email || "");
      }
      setViewState("signup");
    }, 1500);
  };

  const renderKYCInputs = () => {
    if (selectedRole === UserRole.VENDOR) {
      switch (kycStep) {
        case 0:
          return (
            <div className="space-y-4 animate-fade-in-up">
              <Input
                label="Business / Brand Name"
                icon={<Building size={18} />}
                value={vendorKyc.businessName}
                onChange={(v) => setVendorKyc({ ...vendorKyc, businessName: v })}
                placeholder="Acme Events"
              />
              <Input
                label="Mobile Number"
                icon={<Hash size={18} />}
                value={vendorKyc.mobile}
                onChange={(v) => setVendorKyc({ ...vendorKyc, mobile: v })}
                placeholder="+91 9876543210"
              />
              <Input
                label="Email Address"
                icon={<Mail size={18} />}
                value={vendorKyc.email}
                onChange={(v) => setVendorKyc({ ...vendorKyc, email: v })}
                placeholder="contact@acme.com"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  icon={<MapPin size={18} />}
                  value={vendorKyc.city}
                  onChange={(v) => setVendorKyc({ ...vendorKyc, city: v })}
                  placeholder="Jaipur"
                />
                <Input
                  label="Service Area"
                  icon={<Globe size={18} />}
                  value={vendorKyc.serviceArea}
                  onChange={(v) => setVendorKyc({ ...vendorKyc, serviceArea: v })}
                  placeholder="Rajasthan"
                />
              </div>
              <TextArea
                  label="Business Description"
                  value={vendorKyc.description}
                  onChange={(v) => setVendorKyc({ ...vendorKyc, description: v })}
                  placeholder="Tell us about your services, style, and what makes you unique..."
              />
            </div>
          );
        case 1:
          return (
            <div className="space-y-4 animate-fade-in-up">
              <Input
                label="PAN Card Number"
                icon={<BadgeCheck size={18} />}
                value={vendorKyc.panCardNo}
                onChange={(v) => setVendorKyc({ ...vendorKyc, panCardNo: v })}
                placeholder="ABCDE1234F"
              />
               <Input
                label="Aadhar Card Number"
                icon={<BadgeCheck size={18} />}
                value={vendorKyc.aadharCardNo}
                onChange={(v) => setVendorKyc({ ...vendorKyc, aadharCardNo: v })}
                placeholder="1234 5678 9012"
              />
              <Input
                label="Udyam / MSME Registration No"
                icon={<FileText size={18} />}
                value={vendorKyc.businessRegistrationNo}
                onChange={(v) =>
                  setVendorKyc({ ...vendorKyc, businessRegistrationNo: v })
                }
                placeholder="UDYAM-RJ-00-0000000"
              />
              <Input
                label="GST Number (Optional)"
                icon={<FileText size={18} />}
                value={vendorKyc.gstNo}
                onChange={(v) => setVendorKyc({ ...vendorKyc, gstNo: v })}
                placeholder="29ABCDE1234F1Z5"
                required={false}
              />
            </div>
          );
        case 2:
          return (
            <div className="space-y-4 animate-fade-in-up">
              <Input
                label="Account Number"
                icon={<CreditCard size={18} />}
                value={vendorKyc.accountNumber}
                onChange={(v) => setVendorKyc({ ...vendorKyc, accountNumber: v })}
                placeholder="0000000000"
              />
              <Input
                label="Account Holder Name"
                icon={<UserIcon size={18} />}
                value={vendorKyc.accountHolderName}
                onChange={(v) =>
                  setVendorKyc({ ...vendorKyc, accountHolderName: v })
                }
                placeholder="Acme Events Pvt Ltd"
              />
              <Input
                label="IFSC Code"
                icon={<Building size={18} />}
                value={vendorKyc.ifscCode}
                onChange={(v) => setVendorKyc({ ...vendorKyc, ifscCode: v })}
                placeholder="SBIN0001234"
              />
              <FileUpload
                label="Upload Cancelled Cheque"
                value={vendorKyc.cancelledChequeUrl}
                onChange={(v) =>
                  setVendorKyc({ ...vendorKyc, cancelledChequeUrl: v })
                }
              />
            </div>
          );
        case 3:
          return (
            <div className="space-y-4 animate-fade-in-up">
              <TextArea
                label="Cancellation & Refund Policy"
                value={vendorKyc.cancellationPolicy}
                onChange={(v) =>
                  setVendorKyc({ ...vendorKyc, cancellationPolicy: v })
                }
                placeholder="Enter your policy details..."
              />
              <Checkbox
                label="I agree to the Terms & Conditions"
                checked={vendorKyc.termsAccepted}
                onChange={(c) =>
                  setVendorKyc({ ...vendorKyc, termsAccepted: c })
                }
              />
              <Checkbox
                label="I agree to the Platform Commission Agreement (10%)"
                checked={vendorKyc.platformCommissionAccepted}
                onChange={(c) =>
                  setVendorKyc({ ...vendorKyc, platformCommissionAccepted: c })
                }
              />
            </div>
          );
      }
    } else {
      // Planner Inputs
      switch (kycStep) {
        case 0:
          return (
            <div className="space-y-4 animate-fade-in-up">
               <div className="flex items-center gap-4 mb-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Are you an Agency?</label>
                 <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full border border-slate-300 dark:border-slate-600 bg-slate-200 dark:bg-slate-700">
                    <button
                        onClick={() => setPlannerKyc({...plannerKyc, isAgency: !plannerKyc.isAgency})}
                        className={`absolute left-0 inline-block w-6 h-6 transform bg-white rounded-full shadow transition-transform duration-200 ${plannerKyc.isAgency ? 'translate-x-6 bg-primary' : 'translate-x-0'}`}
                    />
                </div>
              </div>

              {plannerKyc.isAgency ? (
                 <Input
                 label="Agency Name"
                 icon={<Building size={18} />}
                 value={plannerKyc.agencyName}
                 onChange={(v) => setPlannerKyc({ ...plannerKyc, agencyName: v })}
                 placeholder="Dream Planners"
               />
              ) : (
                <Input
                label="Owner / Lead Planner Name"
                icon={<UserIcon size={18} />}
                value={plannerKyc.ownerName}
                onChange={(v) => setPlannerKyc({ ...plannerKyc, ownerName: v })}
                placeholder="Jane Doe"
              />
              )}
             
              <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Mobile Number"
                    icon={<Hash size={18} />}
                    value={plannerKyc.mobile}
                    onChange={(v) => setPlannerKyc({ ...plannerKyc, mobile: v })}
                    placeholder="+91 9876543210"
                />
                 <Input
                label="Email Address"
                icon={<Mail size={18} />}
                value={plannerKyc.email}
                onChange={(v) => setPlannerKyc({ ...plannerKyc, email: v })}
                placeholder="planner@example.com"
              />
              </div>
            
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  icon={<MapPin size={18} />}
                  value={plannerKyc.city}
                  onChange={(v) => setPlannerKyc({ ...plannerKyc, city: v })}
                  placeholder="Mumbai"
                />
                <Input
                  label="Years of Experience"
                  icon={<Calendar size={18} />}
                  type="number"
                  value={String(plannerKyc.yearsExperience || "")}
                  onChange={(v) => setPlannerKyc({ ...plannerKyc, yearsExperience: parseInt(v) })}
                  placeholder="5"
                />
              </div>
               <Input
                  label="Service Locations"
                  icon={<Globe size={18} />}
                  value={plannerKyc.serviceLocations}
                  onChange={(v) => setPlannerKyc({ ...plannerKyc, serviceLocations: v })}
                  placeholder="Mumbai, Pune, Goa"
                />
            </div>
          );
        case 1:
          return (
            <div className="space-y-4 animate-fade-in-up">
              <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="PAN Card Number"
                    icon={<BadgeCheck size={18} />}
                    value={plannerKyc.panCardNo}
                    onChange={(v) => setPlannerKyc({ ...plannerKyc, panCardNo: v })}
                    placeholder="ABCDE1234F"
                />
                 <Input
                    label="Aadhar Card Number"
                    icon={<BadgeCheck size={18} />}
                    value={plannerKyc.aadharCardNo}
                    onChange={(v) => setPlannerKyc({ ...plannerKyc, aadharCardNo: v })}
                    placeholder="1234 5678 9012"
                />
              </div>
              
              {plannerKyc.isAgency && (
                 <Input
                 label="Business Registration (Required for Agency)"
                 icon={<FileText size={18} />}
                 value={plannerKyc.businessRegistrationNo}
                 onChange={(v) =>
                   setPlannerKyc({ ...plannerKyc, businessRegistrationNo: v })
                 }
                 placeholder="Reg No"
               />
              )}
              
              <Input
                label="GST Certificate No"
                icon={<FileText size={18} />}
                value={plannerKyc.gstNo}
                onChange={(v) => setPlannerKyc({ ...plannerKyc, gstNo: v })}
                placeholder="GSTIN"
              />
              
              <FileUpload
                label="Police Verification Certificate"
                value={plannerKyc.policeVerificationUrl}
                onChange={(v) =>
                  setPlannerKyc({ ...plannerKyc, policeVerificationUrl: v })
                }
              />

              {plannerKyc.isAgency && (
                 <FileUpload
                 label="Govt ID of Core Team"
                 value={plannerKyc.coreTeamIdUrl}
                 onChange={(v) =>
                   setPlannerKyc({ ...plannerKyc, coreTeamIdUrl: v })
                 }
               />
              )}

              <Checkbox
                label="I declare that I have no criminal record."
                checked={plannerKyc.noCriminalRecordDeclared}
                onChange={(c) =>
                  setPlannerKyc({ ...plannerKyc, noCriminalRecordDeclared: c })
                }
              />
            </div>
          );
        case 2:
            // Banking - Same for both
            return (
            <div className="space-y-4 animate-fade-in-up">
              <Input
                label="Account Number"
                icon={<CreditCard size={18} />}
                value={plannerKyc.accountNumber}
                onChange={(v) => setPlannerKyc({ ...plannerKyc, accountNumber: v })}
                placeholder="0000000000"
              />
              <Input
                label="Account Holder Name"
                icon={<UserIcon size={18} />}
                value={plannerKyc.accountHolderName}
                onChange={(v) =>
                  setPlannerKyc({ ...plannerKyc, accountHolderName: v })
                }
                placeholder="Name"
              />
              <Input
                label="IFSC Code"
                icon={<Building size={18} />}
                value={plannerKyc.ifscCode}
                onChange={(v) => setPlannerKyc({ ...plannerKyc, ifscCode: v })}
                placeholder="SBIN0001234"
              />
              <FileUpload
                label="Upload Cancelled Cheque"
                value={plannerKyc.cancelledChequeUrl}
                onChange={(v) =>
                  setPlannerKyc({ ...plannerKyc, cancelledChequeUrl: v })
                }
              />
            </div>
          );
        case 3:
            return (
                <div className="space-y-4 animate-fade-in-up">
                  <TextArea
                    label="Cancellation & Penalty Policy"
                    value={plannerKyc.cancellationPolicy}
                    onChange={(v) =>
                      setPlannerKyc({ ...plannerKyc, cancellationPolicy: v })
                    }
                    placeholder="Enter policy..."
                  />
                  <Checkbox
                    label="I agree to Platform Terms & Conditions"
                    checked={plannerKyc.termsAccepted}
                    onChange={(c) =>
                      setPlannerKyc({ ...plannerKyc, termsAccepted: c })
                    }
                  />
                  <Checkbox
                    label="I accept the Service Level Agreement"
                    checked={plannerKyc.serviceLevelAgreementAccepted}
                    onChange={(c) =>
                      setPlannerKyc({ ...plannerKyc, serviceLevelAgreementAccepted: c })
                    }
                  />
                   <Checkbox
                    label="I accept Payment & Escrow Rules"
                    checked={plannerKyc.paymentRulesAccepted}
                    onChange={(c) =>
                      setPlannerKyc({ ...plannerKyc, paymentRulesAccepted: c })
                    }
                  />
                </div>
              );
      }
    }
  };


  // --- Google Login Implementation ---
  
  const handleSocialLogin = async (provider: "google") => {
    if (provider === "google") {
        setIsLoading(true);
        try {
            const user = await Backend.Auth.loginWithGoogle();
            onLogin(user);
            addToast(`Signed in as ${user.name}`, "success");
        } catch (error: any) {
            console.error("Google Login Error:", error);
            addToast(error.message || "Failed to sign in with Google", "error");
        } finally {
            setIsLoading(false);
        }
    }
  };

  const RoleCard = ({ role, icon: Icon, title, desc, gradient }: any) => (
    <button
      onClick={() => handleRoleSelect(role)}
      className="group relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 p-8 text-left shadow-lg transition-all hover:-translate-y-2 hover:shadow-2xl border border-slate-100 dark:border-slate-800 w-full h-full flex flex-col"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 transition-opacity group-hover:opacity-5`}
      ></div>
      <div
        className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-md group-hover:scale-110 transition-transform`}
      >
        <Icon size={28} />
      </div>
      <h3 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 mb-6 flex-grow">{desc}</p>
      <div className="flex items-center text-sm font-bold text-slate-900 dark:text-white opacity-0 transition-opacity group-hover:opacity-100 mt-auto">
        Enter Portal <span className="ml-2">→</span>
      </div>
    </button>
  );



  // --- View: Role Selection ---
  if (viewState === "role-selection") {
    return (
      <div className="min-h-screen pt-24 pb-12 flex flex-col justify-center items-center px-4 bg-slate-50 dark:bg-slate-950">
        <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-in-up">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
            Welcome to Eventide
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400">
            Choose your role to access your personalized workspace.
          </p>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full px-4 animate-fade-in-up"
          style={{ animationDelay: "200ms" }}
        >
          <RoleCard
            role={UserRole.CLIENT}
            icon={UserIcon}
            title="Client"
            desc="Plan your dream event, discover experiences, and book top vendors."
            gradient="from-indigo-500 to-blue-500"
          />
          <RoleCard
            role={UserRole.VENDOR}
            icon={Briefcase}
            title="Vendor"
            desc="Manage your business, receive bookings, and track your earnings."
            gradient="from-pink-500 to-rose-500"
          />
          <RoleCard
            role={UserRole.PLANNER}
            icon={Calendar}
            title="Planner"
            desc="Coordinate multiple projects, manage clients, and build timelines."
            gradient="from-violet-500 to-purple-500"
          />
        </div>

        <div className="mt-12 text-slate-400 text-sm">
          Already have an account? Select your role to sign in.
        </div>
      </div>
    );
  }

  // --- View: Login, Signup, Forgot Password & KYC ---
  return (
    <div className="min-h-screen pt-24 pb-12 flex flex-col justify-center items-center px-4 bg-slate-50 dark:bg-slate-950 animate-fade-in-up">
      <div className={`w-full ${viewState === 'kyc-verification' ? 'max-w-3xl' : 'max-w-md'}`}>
        <button
          onClick={() => {
            if (viewState === "kyc-verification" && kycStep > 0) {
                setKycStep(kycStep - 1);
            } else {
                if (viewState === "forgot-password" || viewState === "signup") {
                     setErrors({});
                     setViewState("login");
                } else if (viewState === "kyc-verification") {
                    setViewState("role-selection"); // Or back to where they came from
                } else {
                    setViewState("role-selection");
                }
            }
          }}
          className="mb-8 flex items-center text-slate-500 hover:text-slate-800 transition-colors font-medium"
        >
          <ArrowLeft size={20} className="mr-2" /> Back
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden relative">
          
          {/* Header Section */}
          <div className="p-8 pb-6 text-center">
             {viewState !== 'kyc-verification' && (
                <div
                className={`mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white mb-4 shadow-lg transform transition-transform ${
                    selectedRole === UserRole.CLIENT
                    ? "from-indigo-500 to-blue-500"
                    : selectedRole === UserRole.VENDOR
                    ? "from-pink-500 to-rose-500"
                    : "from-violet-500 to-purple-500"
                }`}
                >
                {selectedRole === UserRole.CLIENT && <UserIcon size={32} />}
                {selectedRole === UserRole.VENDOR && <Briefcase size={32} />}
                {selectedRole === UserRole.PLANNER && <Calendar size={32} />}
                </div>
            )}
            
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {viewState === "forgot-password"
                ? "Account Recovery"
                : viewState === "signup"
                ? `Join as ${
                    selectedRole === UserRole.CLIENT
                      ? "Client"
                      : selectedRole === UserRole.VENDOR
                      ? "Vendor"
                      : "Planner"
                  }`
                : viewState === "kyc-verification"
                ? "Partner Verification"
                : selectedRole === UserRole.CLIENT
                ? "Client Sign In"
                : selectedRole === UserRole.VENDOR
                ? "Vendor Portal"
                : "Planner Workspace"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {viewState === "forgot-password"
                ? "We will send you a link to reset your password."
                : viewState === "signup"
                ? "Create your account to get started"
                : viewState === "kyc-verification"
                ? "Complete these steps to activate your business account."
                : "Secure access to your dashboard"}
            </p>
          </div>

          <div className="p-8 pt-0">
            {viewState === "login" || viewState === "signup" ? (
              <>
                 {/* Social Login Buttons */}
                 {selectedRole === UserRole.CLIENT && (
                  <>
                <div className="space-y-3 mb-6">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSocialLogin("google")}
                    className="w-full py-3.5 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-3 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:shadow-md disabled:opacity-70 text-sm"
                  >
                    <Globe size={18} /> Sign in with Google
                  </button>
                </div>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-slate-900 text-slate-400 font-medium">
                      Or continue with email
                    </span>
                  </div>
                </div>
                  </>
                )}

                {/* Main Auth Form */}
                <form onSubmit={handleAuthSubmit} className="space-y-5">
                  {viewState === "signup" && (
                    <div className="animate-fade-in-up">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                        Full Name
                      </label>
                      <div className="relative group">
                        <div
                          className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${
                            errors.name
                              ? "text-red-400"
                              : "text-slate-400 group-focus-within:text-primary"
                          }`}
                        >
                          <UserIcon size={18} />
                        </div>
                        <input
                          type="text"
                          name="name"
                          autoComplete="name"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            if (errors.name)
                              setErrors({ ...errors, name: undefined });
                          }}
                          className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:ring-4 outline-none transition-all font-medium dark:text-white ${
                            errors.name
                              ? "border-red-300 focus:border-red-400 focus:ring-red-100 bg-red-50 dark:bg-red-900/10"
                              : "border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/20"
                          }`}
                          placeholder="e.g. Jane Smith"
                        />
                      </div>
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1 font-medium ml-1">
                          {errors.name}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                      {selectedRole === UserRole.CLIENT
                        ? "Email Address"
                        : selectedRole === UserRole.VENDOR
                        ? "Business ID or Email"
                        : "Planner License ID or Email"}
                    </label>
                    <div className="relative group">
                      <div
                        className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${
                          errors.identifier
                            ? "text-red-400"
                            : "text-slate-400 group-focus-within:text-primary"
                        }`}
                      >
                        {selectedRole === UserRole.CLIENT && <Mail size={18} />}
                        {selectedRole === UserRole.VENDOR && <Hash size={18} />}
                        {selectedRole === UserRole.PLANNER && (
                          <BadgeCheck size={18} />
                        )}
                      </div>
                      <input
                        type="text"
                        name="identifier"
                        autoComplete={
                          selectedRole === UserRole.CLIENT
                            ? "email"
                            : "username"
                        }
                        value={identifier}
                        onChange={(e) => {
                          setIdentifier(e.target.value);
                          if (errors.identifier)
                            setErrors({ ...errors, identifier: undefined });
                        }}
                        className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:ring-4 outline-none transition-all font-medium dark:text-white ${
                          errors.identifier
                            ? "border-red-300 focus:border-red-400 focus:ring-red-100 bg-red-50 dark:bg-red-900/10"
                            : "border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/20"
                        }`}
                        placeholder={
                          selectedRole === UserRole.CLIENT
                            ? "your@email.com"
                            : selectedRole === UserRole.VENDOR
                            ? "Business ID"
                            : "Planner ID"
                        }
                      />
                    </div>
                    {errors.identifier && (
                      <p className="text-red-500 text-xs mt-1 font-medium ml-1">
                        {errors.identifier}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Password
                      </label>
                      {viewState === "login" && (
                        <button
                          type="button"
                          onClick={() => {
                            setViewState("forgot-password");
                            setErrors({});
                          }}
                          className="text-xs font-bold text-primary hover:text-indigo-700 transition-colors"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative group">
                      <div
                        className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${
                          errors.secret
                            ? "text-red-400"
                            : "text-slate-400 group-focus-within:text-primary"
                        }`}
                      >
                        <Lock size={18} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        autoComplete={
                          viewState === "signup"
                            ? "new-password"
                            : "current-password"
                        }
                        value={secret}
                        onChange={(e) => {
                          setSecret(e.target.value);
                          if (errors.secret)
                            setErrors({ ...errors, secret: undefined });
                        }}
                        className={`w-full pl-11 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:ring-4 outline-none transition-all font-medium dark:text-white ${
                          errors.secret
                            ? "border-red-300 focus:border-red-400 focus:ring-red-100 bg-red-50 dark:bg-red-900/10"
                            : "border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/20"
                        }`}
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {errors.secret && (
                      <p className="text-red-500 text-xs mt-1 font-medium ml-1">
                        {errors.secret}
                      </p>
                    )}
                  </div>

                  {errors.general && (
                    <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl flex items-start gap-3 animate-fade-in-up border border-red-100">
                      <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Access Denied</span>
                        {errors.general}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-primary hover:shadow-primary/30 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin" />
                    ) : viewState === "signup" ? (
                      <>
                        Sign Up <ArrowRight size={18} />
                      </>
                    ) : (
                      <>
                        Sign In <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center pt-6">
                  {viewState === "login" ? (
                    <p className="text-sm text-slate-500">
                      Don't have an account?{" "}
                      <button
                        onClick={() => {
                            if (selectedRole === UserRole.CLIENT) {
                                setViewState("signup");
                            } else {
                                setViewState("kyc-verification");
                            }
                            setErrors({});
                        }}
                        className="font-bold text-primary hover:underline"
                      >
                        Sign up for free
                      </button>
                    </p>
                  ) : (
                    <p className="text-sm text-slate-500">
                      Already have an account?{" "}
                      <button
                        onClick={() => {
                          setViewState("login");
                          setErrors({});
                        }}
                        className="font-bold text-primary hover:underline"
                      >
                        Log in
                      </button>
                    </p>
                  )}
                </div>
              </>
            ) : viewState === "kyc-verification" ? (
              // --- KYC Verification Multi-Step View ---
              <div className="animate-fade-in-up">
                
                {/* Stepper Progress */}
                <div className="flex justify-between items-center mb-8 relative">
                    <div className="absolute left-0 top-1/2 w-full h-1 bg-slate-100 dark:bg-slate-800 -z-10 rounded-full"></div>
                    <div className="absolute left-0 top-1/2 h-1 bg-primary -z-10 rounded-full transition-all duration-300" style={{ width: `${(kycStep / 3) * 100}%` }}></div>
                    
                    {KYC_STEPS.map((step, index) => (
                        <div key={index} className="flex flex-col items-center gap-2">
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${index <= kycStep ? 'bg-primary text-white shadow-lg scale-110' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                                {index < kycStep ? <CheckCircle size={16} /> : index + 1}
                             </div>
                             <span className={`text-[10px] font-bold uppercase tracking-wide hidden sm:block ${index <= kycStep ? 'text-primary' : 'text-slate-400'}`}>{step}</span>
                        </div>
                    ))}
                </div>

                <div className="bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl p-1 mb-6">
                    {renderKYCInputs()}
                </div>

                 <button
                    onClick={kycStep === 3 ? handleKYCComplete : handleNextKYCStep}
                    disabled={isLoading}
                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-primary transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : kycStep === 3 ? "Complete Verification" : "Next Step"}
                        {kycStep !== 3 && !isLoading && <ArrowRight size={18} />}
                 </button>
                 
               </div>
            ) : (
              // --- Forgot Password View ---
              <div className="animate-fade-in-up">
                {recoveryStatus === "sent" ? (
                  <div className="text-center space-y-6 py-4">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
                      <CheckCircle size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        Check your inbox
                      </h3>
                      <p className="text-slate-500 mt-2">
                        If an account exists for{" "}
                        <span className="font-semibold text-slate-900">
                          {recoveryEmail}
                        </span>
                        , we've sent instructions to reset your password.
                      </p>
                    </div>
                    <button
                      onClick={() => setViewState("login")}
                      className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      Return to Login
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleRecoverPassword} className="space-y-5">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 p-4 rounded-xl text-sm text-blue-700 dark:text-blue-400 mb-6">
                      <p className="flex gap-2">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        Enter the email address associated with your account and
                        we'll send you a link to reset your password.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                        Email or User ID
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                          <Mail size={18} />
                        </div>
                        <input
                          type="text"
                          name="recoveryIdentifier"
                          autoComplete="username"
                          value={recoveryEmail}
                          onChange={(e) => setRecoveryEmail(e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium dark:text-white"
                          placeholder="Enter your registered email"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={recoveryStatus === "sending"}
                      className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-primary transition-all disabled:opacity-70 flex justify-center items-center gap-2 hover:-translate-y-0.5"
                    >
                      {recoveryStatus === "sending" ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        "Send Recovery Link"
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---

interface InputProps {
  label: string;
  icon?: React.ReactNode;
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}

const Input: React.FC<InputProps> = ({ label, icon, value, onChange, placeholder, type = "text", required = true }) => (
  <div>
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
        {icon}
      </div>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
        placeholder={placeholder}
        required={required}
      />
    </div>
  </div>
);

interface TextAreaProps {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
}

const TextArea: React.FC<TextAreaProps> = ({ label, value, onChange, placeholder }) => (
  <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
          {label} <span className="text-red-500">*</span>
      </label>
      <textarea 
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white min-h-[100px]"
          placeholder={placeholder}
      />
  </div>
);

interface CheckboxProps {
  label: string;
  checked: boolean | undefined;
  onChange: (checked: boolean) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange }) => (
  <label className="flex items-start gap-3 cursor-pointer group">
      <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-primary border-primary' : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800'}`}>
          {checked && <CheckCircle size={14} className="text-white" />}
      </div>
      <input type="checkbox" className="hidden" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors select-none">
          {label}
      </span>
  </label>
);

interface FileUploadProps {
  label: string;
  value: string | undefined;
  onChange: (url: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ label, value, onChange }) => (
  <div>
       <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
          {label} <span className="text-red-500">*</span>
      </label>
      <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative" onClick={() => {
          // Simulate upload
          onChange("https://placehold.co/400x300?text=Document+Uploaded");
          // NOTE: addToast is local to component, can't simulate easily outside unless passed or ignored for this demo
      }}>
          {value ? (
              <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle size={24} />
                  <span className="font-medium">File Uploaded</span>
                  <button onClick={(e) => { e.stopPropagation(); onChange(""); }} className="text-xs text-red-500 hover:underline ml-2">Remove</button>
              </div>
          ) : (
              <>
                  <Upload size={32} className="text-slate-400 mb-2" />
                  <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Click to upload image/PDF</span>
              </>
          )}
      </div>
  </div>
);

export default Login;
