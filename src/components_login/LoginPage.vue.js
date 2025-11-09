/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import LoginInput from './LoginInput.vue';
import logoIcon from '../assets/icons/rc_logo.svg';
import emailIcon from '../assets/icons/email.svg?raw';
import lockIcon from '../assets/icons/lock.svg?raw';
import nameIcon from '../assets/icons/user.svg?raw';
import confirmIcon from '../assets/icons/check-big.svg?raw';
import browse from '../assets/images/browse2.svg';
import scan from '../assets/images/scan.svg';
import texting from '../assets/images/texting.svg';
import exchange from '../assets/images/exchange.svg';
import { computed, onMounted, reactive, ref } from 'vue';
import { sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, updateProfile, setPersistence, browserLocalPersistence, browserSessionPersistence, signInWithPopup, OAuthProvider, FacebookAuthProvider, TwitterAuthProvider, GoogleAuthProvider, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase-init';
import router from '../router';
function loginEmailPassword() {
    const emailValue = email.value?.trim() || "";
    const passwordValue = password.value || "";
    if (!emailValue) {
        window.alert("Email cannot be blank.");
        return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
        window.alert("Please enter a valid email address.");
        return;
    }
    if (!passwordValue) {
        window.alert("Password cannot be blank.");
        return;
    }
    const persistenceType = rememberMe.value
        ? browserLocalPersistence
        : browserSessionPersistence;
    setPersistence(auth, persistenceType)
        .then(() => {
        return signInWithEmailAndPassword(auth, emailValue, passwordValue);
    })
        .then((userCredential) => {
        if (!userCredential.user.emailVerified) {
            window.alert("Please verify your email before logging in.");
            return;
        }
        console.log("Logged in successfully:", userCredential.user);
        router.push('/dashboard');
    })
        .catch((error) => {
        console.error("Login error:", error);
        window.alert("Failed to log in: " + error.message);
    });
}
function signUpEmailPassword() {
    const nameValue = name.value?.trim() || "";
    const emailValue = email.value?.trim() || "";
    const passwordValue = password.value || "";
    const passwordVerifyValue = confirmPassword.value || "";
    if (!nameValue) {
        window.alert("Name cannot be blank.");
        return;
    }
    if (!emailValue) {
        window.alert("Email cannot be blank.");
        return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
        window.alert("Please enter a valid email address.");
        return;
    }
    if (!passwordValue) {
        window.alert("Password cannot be blank.");
        return;
    }
    if (passwordValue.length < 6) {
        window.alert("Password must be at least 6 characters long.");
        return;
    }
    if (passwordValue !== passwordVerifyValue) {
        window.alert("Passwords do not match.");
        return;
    }
    const persistenceType = rememberMe.value
        ? browserLocalPersistence
        : browserSessionPersistence;
    setPersistence(auth, persistenceType)
        .then(() => {
        return createUserWithEmailAndPassword(auth, emailValue, passwordValue);
    })
        .then((userCredential) => {
        const user = userCredential.user;
        return updateProfile(user, {
            displayName: nameValue,
        }).then(() => user);
    })
        .then((user) => {
        return sendEmailVerification(user);
    })
        .then(() => {
        console.log("User created, profile updated, verification email sent.");
        window.alert("Account created! Please check your email to verify your account before logging in.");
    })
        .catch((error) => {
        console.error("Sign-up error:", error);
        window.alert("Failed to sign up: " + error.message);
    });
}
function signInGoogle() {
    const googleProvider = new GoogleAuthProvider();
    signInWithPopup(auth, googleProvider)
        .then((result) => {
        const credential = OAuthProvider.credentialFromResult(result);
        const accessToken = credential.accessToken;
        const idToken = credential.idToken;
        console.log(accessToken);
        console.log(idToken);
        console.log(result);
        router.push('/dashboard');
    })
        .catch((error) => {
        console.error(error);
    });
}
function signInMicrosoft() {
    const microsoftProvider = new OAuthProvider('microsoft.com');
    signInWithPopup(auth, microsoftProvider)
        .then((result) => {
        const credential = OAuthProvider.credentialFromResult(result);
        const accessToken = credential.accessToken;
        const idToken = credential.idToken;
        console.log(accessToken);
        console.log(idToken);
        console.log(result);
        router.push('/dashboard');
    })
        .catch((error) => {
        console.error(error);
    });
}
function signInMeta() {
    const facebookProvider = new FacebookAuthProvider();
    signInWithPopup(auth, facebookProvider)
        .then((result) => {
        const credential = OAuthProvider.credentialFromResult(result);
        const accessToken = credential.accessToken;
        const idToken = credential.idToken;
        console.log(accessToken);
        console.log(idToken);
        console.log(result);
        router.push('/dashboard');
    })
        .catch((error) => {
        console.error(error);
    });
}
function signInTwitter() {
    const twitterProvider = new TwitterAuthProvider();
    signInWithPopup(auth, twitterProvider)
        .then((result) => {
        const credential = OAuthProvider.credentialFromResult(result);
        const accessToken = credential.accessToken;
        const idToken = credential.idToken;
        console.log(accessToken);
        console.log(idToken);
        console.log(result);
        router.push('/dashboard');
    })
        .catch((error) => {
        console.error(error);
    });
}
async function resetPassword() {
    try {
        if (!email.value) {
            window.alert("Email cannot be blank.");
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value)) {
            window.alert("Please enter a valid email address.");
            return;
        }
        await sendPasswordResetEmail(auth, email.value);
        alert('Password reset email sent!');
    }
    catch (error) {
        alert(`Error: ${error.message}`);
        console.error(error);
    }
}
const image_data = reactive([
    [scan, "Scan your book — we'll fetch the details.", true],
    [browse, "Browse books from nearby families.", false],
    [texting, "Message parents to coordinate exchange.", false],
    [exchange, "Exchange books in person or drop-off.", false]
]);
let counter = 0;
const email = ref('');
const password = ref('');
const name = ref('');
const confirmPassword = ref('');
onMounted(() => {
    setInterval(() => {
        image_data.forEach((item, index) => {
            item[2] = index === counter;
        });
        counter = (counter + 1) % image_data.length;
    }, 5000);
});
const activeItem = computed(() => {
    return image_data.find(item => item[2]);
});
const rememberMe = ref(true);
const newUser = ref(false);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['sign-up']} */ ;
/** @type {__VLS_StyleScopedClasses['alt-login']} */ ;
/** @type {__VLS_StyleScopedClasses['login-logo']} */ ;
/** @type {__VLS_StyleScopedClasses['logo-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['login-box']} */ ;
/** @type {__VLS_StyleScopedClasses['login-header']} */ ;
/** @type {__VLS_StyleScopedClasses['login-para']} */ ;
/** @type {__VLS_StyleScopedClasses['social-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['login-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['forgot-password']} */ ;
/** @type {__VLS_StyleScopedClasses['remember-me-container']} */ ;
/** @type {__VLS_StyleScopedClasses['fade-enter-active']} */ ;
/** @type {__VLS_StyleScopedClasses['fade-leave-active']} */ ;
/** @type {__VLS_StyleScopedClasses['fade-enter-from']} */ ;
/** @type {__VLS_StyleScopedClasses['fade-leave-to']} */ ;
/** @type {__VLS_StyleScopedClasses['login-box']} */ ;
/** @type {__VLS_StyleScopedClasses['login-logo']} */ ;
/** @type {__VLS_StyleScopedClasses['logo-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['login-header']} */ ;
/** @type {__VLS_StyleScopedClasses['social-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['graphic-half-login']} */ ;
/** @type {__VLS_StyleScopedClasses['sign-up']} */ ;
/** @type {__VLS_StyleScopedClasses['login-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['forgot-password']} */ ;
/** @type {__VLS_StyleScopedClasses['remember-me-container']} */ ;
/** @type {__VLS_StyleScopedClasses['alt-login']} */ ;
/** @type {__VLS_StyleScopedClasses['tooltip']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "login-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "login-box" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "text-half-login" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "login-logo" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.img, __VLS_intrinsicElements.img)({
    src: (__VLS_ctx.logoIcon),
    alt: "ReadCycle Logo",
    ...{ class: "logo-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "company-name" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "login-header-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "login-header" },
});
(__VLS_ctx.newUser ? "Sign Up" : "Welcome Back!");
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "login-para" },
});
(__VLS_ctx.newUser ? "Create your account below!" : "Login with your email or use one of the following:");
if (__VLS_ctx.newUser == true) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "social-hint" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.newUser == true))
                    return;
                __VLS_ctx.newUser = false;
            } },
    });
}
if (__VLS_ctx.newUser == false) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "alternatives-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.newUser == false))
                    return;
                __VLS_ctx.signInGoogle();
            } },
        ...{ class: "alt-login" },
        ref: "googleBtn",
    });
    /** @type {typeof __VLS_ctx.googleBtn} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 640 640",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
        d: "M564 325.8C564 467.3 467.1 568 324 568C186.8 568 76 457.2 76 320C76 182.8 186.8 72 324 72C390.8 72 447 96.5 490.3 136.9L422.8 201.8C334.5 116.6 170.3 180.6 170.3 320C170.3 406.5 239.4 476.6 324 476.6C422.2 476.6 459 406.2 464.8 369.7L324 369.7L324 284.4L560.1 284.4C562.4 297.1 564 309.3 564 325.8z",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tooltip" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.newUser == false))
                    return;
                __VLS_ctx.signInMeta();
            } },
        ...{ class: "alt-login" },
        ref: "metaBtn",
    });
    /** @type {typeof __VLS_ctx.metaBtn} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 640 640",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
        d: "M640 381.9C640 473.2 600.6 530.4 529.7 530.4C467.1 530.4 433.9 495.8 372.8 393.8L341.4 341.2C333.1 328.7 326.9 317 320.2 306.2C300.1 340 273.1 389.2 273.1 389.2C206.1 505.8 168.5 530.4 116.2 530.4C43.4 530.4 0 473.1 0 384.5C0 241.5 79.8 106.4 183.9 106.4C234.1 106.4 277.7 131.1 328.7 195.9C365.8 145.8 406.8 106.4 459.3 106.4C558.4 106.4 640 232.1 640 381.9zM287.4 256.2C244.5 194.1 216.5 175.7 183 175.7C121.1 175.7 69.2 281.8 69.2 385.7C69.2 434.2 87.7 461.4 118.8 461.4C149 461.4 167.8 442.4 222 357.6C222 357.6 246.7 318.5 287.4 256.2zM531.2 461.4C563.4 461.4 578.1 433.9 578.1 386.5C578.1 262.3 523.8 161.1 454.9 161.1C421.7 161.1 393.8 187 360 239.1C369.4 252.9 379.1 268.1 389.3 284.5L426.8 346.9C485.5 441 500.3 461.4 531.2 461.4z",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tooltip" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.newUser == false))
                    return;
                __VLS_ctx.signInTwitter();
            } },
        ...{ class: "alt-login" },
        ref: "twitterBtn",
    });
    /** @type {typeof __VLS_ctx.twitterBtn} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 640 640",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
        d: "M523.4 215.7C523.7 220.2 523.7 224.8 523.7 229.3C523.7 368 418.1 527.9 225.1 527.9C165.6 527.9 110.4 510.7 64 480.8C72.4 481.8 80.6 482.1 89.3 482.1C138.4 482.1 183.5 465.5 219.6 437.3C173.5 436.3 134.8 406.1 121.5 364.5C128 365.5 134.5 366.1 141.3 366.1C150.7 366.1 160.1 364.8 168.9 362.5C120.8 352.8 84.8 310.5 84.8 259.5L84.8 258.2C98.8 266 115 270.9 132.2 271.5C103.9 252.7 85.4 220.5 85.4 184.1C85.4 164.6 90.6 146.7 99.7 131.1C151.4 194.8 229 236.4 316.1 240.9C314.5 233.1 313.5 225 313.5 216.9C313.5 159.1 360.3 112 418.4 112C448.6 112 475.9 124.7 495.1 145.1C518.8 140.6 541.6 131.8 561.7 119.8C553.9 144.2 537.3 164.6 515.6 177.6C536.7 175.3 557.2 169.5 576 161.4C561.7 182.2 543.8 200.7 523.4 215.7z",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tooltip" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.newUser == false))
                    return;
                __VLS_ctx.signInMicrosoft();
            } },
        ...{ class: "alt-login" },
        ref: "microsoftBtn",
    });
    /** @type {typeof __VLS_ctx.microsoftBtn} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 640 640",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
        d: "M96 96L310.6 96L310.6 310.6L96 310.6L96 96zM329.4 96L544 96L544 310.6L329.4 310.6L329.4 96zM96 329.4L310.6 329.4L310.6 544L96 544L96 329.4zM329.4 329.4L544 329.4L544 544L329.4 544L329.4 329.4z",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tooltip" },
    });
}
if (__VLS_ctx.newUser == false) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "divider-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.hr)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.hr)({});
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "login-inputs" },
    ...{ style: ({ gridRow: __VLS_ctx.newUser ? '6 / 17' : '11 / 17', justifyContent: __VLS_ctx.newUser ? 'center' : 'space-between', rowGap: __VLS_ctx.newUser ? '14px' : '0' }) },
});
if (__VLS_ctx.newUser == true) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "login-input-wrapper" },
    });
    /** @type {[typeof LoginInput, ]} */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(LoginInput, new LoginInput({
        modelValue: (__VLS_ctx.name),
        fieldName: ('Name'),
        fieldIcon: (__VLS_ctx.nameIcon),
        placeholder: ('John Doe'),
        isPassword: (false),
    }));
    const __VLS_1 = __VLS_0({
        modelValue: (__VLS_ctx.name),
        fieldName: ('Name'),
        fieldIcon: (__VLS_ctx.nameIcon),
        placeholder: ('John Doe'),
        isPassword: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_0));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "login-input-wrapper" },
});
/** @type {[typeof LoginInput, ]} */ ;
// @ts-ignore
const __VLS_3 = __VLS_asFunctionalComponent(LoginInput, new LoginInput({
    modelValue: (__VLS_ctx.email),
    fieldName: ('Email'),
    fieldIcon: (__VLS_ctx.emailIcon),
    placeholder: ('example@abc.com'),
    isPassword: (false),
}));
const __VLS_4 = __VLS_3({
    modelValue: (__VLS_ctx.email),
    fieldName: ('Email'),
    fieldIcon: (__VLS_ctx.emailIcon),
    placeholder: ('example@abc.com'),
    isPassword: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_3));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "login-input-wrapper" },
});
/** @type {[typeof LoginInput, ]} */ ;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(LoginInput, new LoginInput({
    modelValue: (__VLS_ctx.password),
    fieldName: ('Password'),
    fieldIcon: (__VLS_ctx.lockIcon),
    placeholder: ('••••••••'),
    isPassword: (true),
}));
const __VLS_7 = __VLS_6({
    modelValue: (__VLS_ctx.password),
    fieldName: ('Password'),
    fieldIcon: (__VLS_ctx.lockIcon),
    placeholder: ('••••••••'),
    isPassword: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
if (__VLS_ctx.newUser == true) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "login-input-wrapper" },
    });
    /** @type {[typeof LoginInput, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(LoginInput, new LoginInput({
        modelValue: (__VLS_ctx.confirmPassword),
        fieldName: ('Verify Password'),
        fieldIcon: (__VLS_ctx.confirmIcon),
        placeholder: ('••••••••'),
        isPassword: (true),
    }));
    const __VLS_10 = __VLS_9({
        modelValue: (__VLS_ctx.confirmPassword),
        fieldName: ('Verify Password'),
        fieldIcon: (__VLS_ctx.confirmIcon),
        placeholder: ('••••••••'),
        isPassword: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "metadata-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "remember-me-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    type: "checkbox",
    id: "remember-me-checkbox",
    checked: true,
});
(__VLS_ctx.rememberMe);
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "remember-me-text" },
    for: "remember-me-checkbox",
});
if (__VLS_ctx.newUser == false) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.newUser == false))
                    return;
                __VLS_ctx.resetPassword();
            } },
        ...{ class: "forgot-password" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "login-btn-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "login-btn-wrapper" },
});
if (__VLS_ctx.newUser == false) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.newUser == false))
                    return;
                __VLS_ctx.loginEmailPassword();
            } },
        ...{ class: "login-btn" },
    });
}
if (__VLS_ctx.newUser == true) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.newUser == true))
                    return;
                __VLS_ctx.signUpEmailPassword();
            } },
        ...{ class: "login-btn" },
    });
}
if (__VLS_ctx.newUser == false) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.newUser == false))
                    return;
                __VLS_ctx.newUser = true;
            } },
        ...{ class: "sign-up" },
    });
}
if (__VLS_ctx.newUser == true) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.newUser == true))
                    return;
                __VLS_ctx.newUser = false;
            } },
        ...{ class: "sign-up" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "graphic-half-login" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "carousel-container" },
});
const __VLS_12 = {}.transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    name: "fade",
    mode: "out-in",
}));
const __VLS_14 = __VLS_13({
    name: "fade",
    mode: "out-in",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
if (__VLS_ctx.activeItem) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "carousel-item" },
        key: (__VLS_ctx.activeItem[0]),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "image-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        src: (__VLS_ctx.activeItem[0]),
        alt: "Scan",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "image-caption" },
    });
    (__VLS_ctx.activeItem[1]);
}
var __VLS_15;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "slide-indicator-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "slide-indicator" },
});
for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.image_data))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "dot" },
        ...{ class: ({ filled: item[2] }) },
        key: (index),
    });
}
/** @type {__VLS_StyleScopedClasses['login-container']} */ ;
/** @type {__VLS_StyleScopedClasses['login-box']} */ ;
/** @type {__VLS_StyleScopedClasses['text-half-login']} */ ;
/** @type {__VLS_StyleScopedClasses['login-logo']} */ ;
/** @type {__VLS_StyleScopedClasses['logo-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['company-name']} */ ;
/** @type {__VLS_StyleScopedClasses['login-header-container']} */ ;
/** @type {__VLS_StyleScopedClasses['login-header']} */ ;
/** @type {__VLS_StyleScopedClasses['login-para']} */ ;
/** @type {__VLS_StyleScopedClasses['social-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['alternatives-container']} */ ;
/** @type {__VLS_StyleScopedClasses['alt-login']} */ ;
/** @type {__VLS_StyleScopedClasses['tooltip']} */ ;
/** @type {__VLS_StyleScopedClasses['alt-login']} */ ;
/** @type {__VLS_StyleScopedClasses['tooltip']} */ ;
/** @type {__VLS_StyleScopedClasses['alt-login']} */ ;
/** @type {__VLS_StyleScopedClasses['tooltip']} */ ;
/** @type {__VLS_StyleScopedClasses['alt-login']} */ ;
/** @type {__VLS_StyleScopedClasses['tooltip']} */ ;
/** @type {__VLS_StyleScopedClasses['divider-container']} */ ;
/** @type {__VLS_StyleScopedClasses['login-inputs']} */ ;
/** @type {__VLS_StyleScopedClasses['login-input-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['login-input-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['login-input-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['login-input-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['metadata-container']} */ ;
/** @type {__VLS_StyleScopedClasses['remember-me-container']} */ ;
/** @type {__VLS_StyleScopedClasses['remember-me-text']} */ ;
/** @type {__VLS_StyleScopedClasses['forgot-password']} */ ;
/** @type {__VLS_StyleScopedClasses['login-btn-container']} */ ;
/** @type {__VLS_StyleScopedClasses['login-btn-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['login-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['login-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['sign-up']} */ ;
/** @type {__VLS_StyleScopedClasses['sign-up']} */ ;
/** @type {__VLS_StyleScopedClasses['graphic-half-login']} */ ;
/** @type {__VLS_StyleScopedClasses['carousel-container']} */ ;
/** @type {__VLS_StyleScopedClasses['carousel-item']} */ ;
/** @type {__VLS_StyleScopedClasses['image-container']} */ ;
/** @type {__VLS_StyleScopedClasses['image-caption']} */ ;
/** @type {__VLS_StyleScopedClasses['slide-indicator-container']} */ ;
/** @type {__VLS_StyleScopedClasses['slide-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['dot']} */ ;
/** @type {__VLS_StyleScopedClasses['filled']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            LoginInput: LoginInput,
            logoIcon: logoIcon,
            emailIcon: emailIcon,
            lockIcon: lockIcon,
            nameIcon: nameIcon,
            confirmIcon: confirmIcon,
            loginEmailPassword: loginEmailPassword,
            signUpEmailPassword: signUpEmailPassword,
            signInGoogle: signInGoogle,
            signInMicrosoft: signInMicrosoft,
            signInMeta: signInMeta,
            signInTwitter: signInTwitter,
            resetPassword: resetPassword,
            image_data: image_data,
            email: email,
            password: password,
            name: name,
            confirmPassword: confirmPassword,
            activeItem: activeItem,
            rememberMe: rememberMe,
            newUser: newUser,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
