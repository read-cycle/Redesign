<script setup lang="ts">
import LoginInput from './LoginInput.vue';
import logoIcon from '../assets/icons/rc_logo.svg';
import emailIcon from '../assets/icons/email.svg?raw'
import lockIcon from '../assets/icons/lock.svg?raw'
import nameIcon from '../assets/icons/user.svg?raw'
import confirmIcon from '../assets/icons/check-big.svg?raw'
import browse from '../assets/images/browse2.svg'
import scan from '../assets/images/scan.svg'
import texting from '../assets/images/texting.svg'
import exchange from '../assets/images/exchange.svg'
import { computed, onMounted, reactive, ref } from 'vue';
import { type OAuthCredential, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, updateProfile, setPersistence, browserLocalPersistence, browserSessionPersistence, signInWithPopup, OAuthProvider, FacebookAuthProvider, TwitterAuthProvider, GoogleAuthProvider, createUserWithEmailAndPassword  } from "firebase/auth";
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
    .then((userCredential: { user: any }) => {
      if (!userCredential.user.emailVerified) {
        window.alert("Please verify your email before logging in.");
        return;
      }
      console.log("Logged in successfully:", userCredential.user);
      router.push('/dashboard');
    })
    .catch((error: { message: string }) => {
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
    .then((userCredential: { user: any; }) => {
      const user = userCredential.user;

      return updateProfile(user, {
        displayName: nameValue,
      }).then(() => user);
    })
    .then((user: any) => {
      return sendEmailVerification(user);
    })
    .then(() => {
      console.log("User created, profile updated, verification email sent.");
      window.alert("Account created! Please check your email to verify your account before logging in.");
    })
    .catch((error: { message: string; }) => {
      console.error("Sign-up error:", error);
      window.alert("Failed to sign up: " + error.message);
    });
}

function signInGoogle() {
    const googleProvider = new GoogleAuthProvider();
    signInWithPopup(auth, googleProvider)
      .then((result: any) => {
        const credential = OAuthProvider.credentialFromResult(result) as OAuthCredential;
        const accessToken = credential.accessToken;
        const idToken = credential.idToken;
        console.log(accessToken);
        console.log(idToken);
        console.log(result);
        router.push('/dashboard');
      })
      .catch((error: any) => {
        console.error(error);
      });
}

function signInMicrosoft() {
    const microsoftProvider = new OAuthProvider('microsoft.com');
    signInWithPopup(auth, microsoftProvider)
      .then((result: any) => {
        const credential = OAuthProvider.credentialFromResult(result) as OAuthCredential;
        const accessToken = credential.accessToken;
        const idToken = credential.idToken;
        console.log(accessToken);
        console.log(idToken);
        console.log(result);
        router.push('/dashboard');
      })
      .catch((error: any) => {
        console.error(error);
      });
}

function signInMeta() {
    const facebookProvider = new FacebookAuthProvider();
    signInWithPopup(auth, facebookProvider)
      .then((result: any) => {
        const credential = OAuthProvider.credentialFromResult(result) as OAuthCredential;
        const accessToken = credential.accessToken;
        const idToken = credential.idToken;
        console.log(accessToken);
        console.log(idToken);
        console.log(result);
        router.push('/dashboard');
      })
      .catch((error: any) => {
        console.error(error);
      });
}

function signInTwitter() {
    const twitterProvider = new TwitterAuthProvider();
    signInWithPopup(auth, twitterProvider)
      .then((result: any) => {
        const credential = OAuthProvider.credentialFromResult(result) as OAuthCredential;
        const accessToken = credential.accessToken;
        const idToken = credential.idToken;
        console.log(accessToken);
        console.log(idToken);
        console.log(result);
        router.push('/dashboard');
      })
      .catch((error: any) => {
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
  } catch (error: any) {
    alert(`Error: ${error.message}`);
    console.error(error);
  }
}

const image_data = reactive<[string, string, boolean][]>([
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
</script>
<template>
    <div class="login-container">
            <div class="login-box">
                <div class="text-half-login">
                  <div class="login-logo">
                    <img :src="logoIcon" alt="ReadCycle Logo" class="logo-icon">
                    <span class="company-name">ReadCycle</span>
                  </div>
              
                  <div class="login-header-container">
                        <h1 class="login-header">{{ newUser ? "Sign Up" : "Welcome Back!" }}</h1>
                        <p class="login-para">{{ newUser ? "Create your account below!" : "Login with your email or use one of the following:" }}</p>
                        <p class="social-hint" v-if="newUser == true">
                          Want to use Google, Meta, Twitter or Microsoft? <a @click="newUser = false">Go back</a> and sign up instantly.
                        </p>
                  </div>

                  <div class="alternatives-container" v-if="newUser == false">
                    <button class="alt-login" ref="googleBtn" @click="signInGoogle()">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M564 325.8C564 467.3 467.1 568 324 568C186.8 568 76 457.2 76 320C76 182.8 186.8 72 324 72C390.8 72 447 96.5 490.3 136.9L422.8 201.8C334.5 116.6 170.3 180.6 170.3 320C170.3 406.5 239.4 476.6 324 476.6C422.2 476.6 459 406.2 464.8 369.7L324 369.7L324 284.4L560.1 284.4C562.4 297.1 564 309.3 564 325.8z"/></svg>
                        <div class="tooltip">Google</div>
                    </button>
                    <button class="alt-login" ref="metaBtn" @click="signInMeta()">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M640 381.9C640 473.2 600.6 530.4 529.7 530.4C467.1 530.4 433.9 495.8 372.8 393.8L341.4 341.2C333.1 328.7 326.9 317 320.2 306.2C300.1 340 273.1 389.2 273.1 389.2C206.1 505.8 168.5 530.4 116.2 530.4C43.4 530.4 0 473.1 0 384.5C0 241.5 79.8 106.4 183.9 106.4C234.1 106.4 277.7 131.1 328.7 195.9C365.8 145.8 406.8 106.4 459.3 106.4C558.4 106.4 640 232.1 640 381.9zM287.4 256.2C244.5 194.1 216.5 175.7 183 175.7C121.1 175.7 69.2 281.8 69.2 385.7C69.2 434.2 87.7 461.4 118.8 461.4C149 461.4 167.8 442.4 222 357.6C222 357.6 246.7 318.5 287.4 256.2zM531.2 461.4C563.4 461.4 578.1 433.9 578.1 386.5C578.1 262.3 523.8 161.1 454.9 161.1C421.7 161.1 393.8 187 360 239.1C369.4 252.9 379.1 268.1 389.3 284.5L426.8 346.9C485.5 441 500.3 461.4 531.2 461.4z"/></svg>
                        <div class="tooltip">Meta</div>
                    </button>
                    <button class="alt-login" ref="twitterBtn" @click="signInTwitter()">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M523.4 215.7C523.7 220.2 523.7 224.8 523.7 229.3C523.7 368 418.1 527.9 225.1 527.9C165.6 527.9 110.4 510.7 64 480.8C72.4 481.8 80.6 482.1 89.3 482.1C138.4 482.1 183.5 465.5 219.6 437.3C173.5 436.3 134.8 406.1 121.5 364.5C128 365.5 134.5 366.1 141.3 366.1C150.7 366.1 160.1 364.8 168.9 362.5C120.8 352.8 84.8 310.5 84.8 259.5L84.8 258.2C98.8 266 115 270.9 132.2 271.5C103.9 252.7 85.4 220.5 85.4 184.1C85.4 164.6 90.6 146.7 99.7 131.1C151.4 194.8 229 236.4 316.1 240.9C314.5 233.1 313.5 225 313.5 216.9C313.5 159.1 360.3 112 418.4 112C448.6 112 475.9 124.7 495.1 145.1C518.8 140.6 541.6 131.8 561.7 119.8C553.9 144.2 537.3 164.6 515.6 177.6C536.7 175.3 557.2 169.5 576 161.4C561.7 182.2 543.8 200.7 523.4 215.7z"/></svg>
                        <div class="tooltip">Twitter/X</div>
                    </button>
                    <button class="alt-login" ref="microsoftBtn" @click="signInMicrosoft()">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M96 96L310.6 96L310.6 310.6L96 310.6L96 96zM329.4 96L544 96L544 310.6L329.4 310.6L329.4 96zM96 329.4L310.6 329.4L310.6 544L96 544L96 329.4zM329.4 329.4L544 329.4L544 544L329.4 544L329.4 329.4z"/></svg>
                        <div class="tooltip">Microsoft</div>
                    </button>
                  </div>

                  <div class="divider-container" v-if="newUser == false">
                    <hr/>or<hr/>
                  </div>

                  <div class="login-inputs" :style="{gridRow: newUser ? '6 / 17' : '11 / 17', justifyContent: newUser ? 'center' : 'space-between', rowGap: newUser ? '14px' : '0'}">
                    <div class="login-input-wrapper" v-if="newUser == true">
                        <LoginInput v-model="name" :field-name="'Name'" :field-icon="nameIcon" :placeholder="'John Doe'" :is-password="false" />
                    </div>
                    <div class="login-input-wrapper">
                        <LoginInput v-model="email" :field-name="'Email'" :field-icon="emailIcon" :placeholder="'example@abc.com'" :is-password="false" />
                    </div>
                    <div class="login-input-wrapper">
                        <LoginInput v-model="password" :field-name="'Password'" :field-icon="lockIcon" :placeholder="'••••••••'" :is-password="true" />
                    </div>
                    <div class="login-input-wrapper" v-if="newUser == true">
                        <LoginInput v-model="confirmPassword" :field-name="'Verify Password'" :field-icon="confirmIcon" :placeholder="'••••••••'" :is-password="true" />
                    </div>
                    <div class="metadata-container">
                        <div class="remember-me-container">
                            <input type="checkbox" id="remember-me-checkbox" v-model="rememberMe" checked/>
                            <label class="remember-me-text" for="remember-me-checkbox">Remember me</label>
                        </div>
                        <p class="forgot-password" v-if="newUser == false" @click="resetPassword()">Forgot Password?</p>
                    </div>
                  </div>

                  <div class="login-btn-container">
                    <div class="login-btn-wrapper">
                        <button class="login-btn" @click="loginEmailPassword()" v-if="newUser == false">Log In</button>
                        <button class="login-btn" @click="signUpEmailPassword()" v-if="newUser == true">Sign Up</button>
                    </div>
                    <p class="sign-up" @click="newUser = true" v-if="newUser == false">Don't have an account? Sign Up</p>
                    <p class="sign-up" @click="newUser = false" v-if="newUser == true">Have an account? Log in</p>
                  </div>
                </div>
                <div class="graphic-half-login">
                    <div class="carousel-container">
                        <transition name="fade" mode="out-in">
                            <div class="carousel-item"
                            v-if="activeItem"
                            :key="activeItem[0]">
                                <div class="image-container">
                                    <img :src="activeItem[0]" alt="Scan" />
                                </div>
                                <div class="image-caption">{{ activeItem[1] }}</div>
                            </div>
                        </transition>
                        <div class="slide-indicator-container">
                            <div class="slide-indicator">
                                <div
                                  class="dot"
                                  :class="{ filled: item[2] }"
                                  v-for="(item, index) in image_data"
                                  :key="index"
                                ></div>               
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    </div>
</template>
<style lang="scss" scoped>
@media screen and (max-width: 850px) {
  .sign-up {
    font-size: px-to-vw(28);
  }
  .alt-login {
    svg {
        width: px-to-vw(45);
        height: px-to-vw(45);
    }
  }
  .graphic-half-login {
    display: none;
  }
  .login-box {
    aspect-ratio: 4/5;
  }
  .login-logo {
      .logo-icon {
          width: px-to-vw(75);
      }
      font-size: px-to-vw(45);
  }
  .login-header{
    font-size: 6vw;
  }
  .login-para {
    font-size: px-to-vw(26);
  }
  .social-hint {
    font-size: px-to-vw(26);
  }
  .login-btn {
    font-size: px-to-vw(50);
  }
  .forgot-password {
    font-size: px-to-vw(28);
  }
  .remember-me-container {
    font-size: px-to-vw(28);
  }
}
@media screen and (min-width: 850px) {
  .sign-up {
    font-size: px-to-vw(14);
  }
  .alt-login {
    svg {
        width: px-to-vw(20);
        height: px-to-vw(20);
    }
  }
  .login-logo {
      .logo-icon {
          width: px-to-vw(25);
      }
      font-size: px-to-vw(15);
  }
  .login-box {
    aspect-ratio: 2/1;
  }
  .login-header{
    font-size: 3vw;
  }
  .login-para {
    font-size: px-to-vw(13);
  }
  .social-hint {
    font-size: px-to-vw(13);
  }
  .login-btn {
    font-size: px-to-vw(20);
  }
  .forgot-password {
    font-size: px-to-vw(14);
  }
  .remember-me-container {
    font-size: px-to-vw(14);
  }
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  
  width: px-to-vw(18);
  height: px-to-vw(18);
  border: 2px solid #999;
  border-radius:  px-to-vw(4);
  cursor: pointer;
  position: relative;
  transition: background 0.2s ease;
}
input[type="checkbox"]:checked {
  background-color: $color-primary;
  border-color: transparent;
}
input[type="checkbox"]:checked::after {
  content: "";
  position: absolute;
  top: 40%;
  left: 50%;
  width: 40%;
  height: 80%;
  border: solid white;
  border-width: 0 0.2vw 0.2vw 0;
  border-radius: 2px;
  transform: translate(-50%, -50%) rotate(45deg);
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.login-container {
    color: $color-text;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: $color-background-tertiary;
}
.login-box {
    width: 72%;
    background-color: $color-background;
    border-radius: 30px;
    display: flex;
    overflow: hidden;
}
.text-half-login {
    flex: 1;
    display: grid;
    padding: 4vw;
    padding-top: 0;
    font-family: 'Manrope';
    grid-template-rows: repeat(20, 1fr);    
    .login-logo {
        display: flex;
        align-items: center;
        grid-row: 2/3;
        height: 100%;
        column-gap: 10px;
        .logo-icon {
            aspect-ratio: 1/1; 
        }
    }
    .login-header-container {
        grid-row: 4/5;
        .login-header {
            color: $color-accent;
        }
        .social-hint {
            a {
                text-decoration: underline;
                color: $color-accent;
                cursor: pointer;
            }
        }
    }
}
.graphic-half-login {
    flex: 1;
    padding: 0.5vw;
    .carousel-container {
        padding: 1vw;
        width: 100%;
        height: 100%;
        border-radius: 30px;
        background-color: $color-accent-lightened;
        .carousel-item {
            width: 100%;
            height: 90%;
            display: flex;
            flex-direction: column;
            .image-container {
                height: 90%;
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                img {
                    height: 100%;
                }
            }
            .image-caption {
                height: 10%;
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'Nunito';
                color: white;
                font-size: px-to-vw(15);
            }
        }
        .slide-indicator-container {
            height: 10%;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            .slide-indicator {
                width: 80px;
                aspect-ratio: 3/1;
                display: flex;
                justify-content: space-evenly;
                align-items: center;
                background-color: rgba($color-accent, 0.5);
                border-radius: 5px;
                .dot {
                    width: 4px;
                    aspect-ratio: 1/1;
                    border-radius: 50%;
                }
                .filled {
                    background-color: white;
                }
            }
        }

    }
}
.login-btn-container {
    grid-row: 18/21;
    display: flex;
    flex-direction: column;
    row-gap: px-to-vw(10);
    .sign-up {
        color: $color-accent;
        text-decoration: underline;
        cursor: pointer;
        width: fit-content;
    }
    .login-btn-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        width: 100%;
        .login-btn {
            height: 100%;
            aspect-ratio: 4/1;
            font-family: 'Nunito';
            border-radius: 14px;
            background: linear-gradient(to right, $color-secondary, $color-secondary-lightened);
            cursor: pointer;
            border: 4px solid $color-background;
            transition: box-shadow 0.4s ease;
            &:hover {
                box-shadow: 0 0 0 4px $color-primary;
            }
        }    
    }
}
.login-inputs {
    display: flex;
    flex-direction: column;
    .login-input-wrapper {
        width: 50%;
    }
    .metadata-container {
        width: 50%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .forgot-password {
            color: $color-accent;
            text-decoration: underline;
            cursor: pointer;
            width: fit-content;
        }
        .remember-me-container {
            display: flex;
            align-items: center;
            column-gap: 5px;
            color: $color-accent;
        }
    }

}
.alternatives-container {
    display: flex;
    align-items: center;
    justify-content: center;
    column-gap: 5px;
    grid-row: 6/8;
    .alt-login {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        aspect-ratio: 1/1;
        border-radius: 30px;
        border: none;
        cursor: pointer;
        background-color: $color-secondary; 
        border: 2px solid $color-background;
        transition: box-shadow 0.4s ease;
        &:hover {
            box-shadow: 0 0 0 2px $color-primary;
            .tooltip {
                opacity: 1;
            }
        }
        .tooltip {
            position: absolute;
            width: 110%;
            height: 50%;
            top: -50%;
            left: -5%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            opacity: 0;
            align-items: center;
            justify-content: center;
            color: white;
            padding: 10px;
            font-size: px-to-vw(10);
            transition: opacity 500ms ease-in-out;
        }
    }
}
.divider-container {
    grid-row: 9/10;
    display: flex;
    align-items: center;
    justify-content: center;
    column-gap: 10px;
    width: 100%;
    font-size: px-to-vw(14);
    hr {
        width: 100%;
        height: 1px;
        margin-top: px-to-vw(2.5);
        opacity: 0.5;
    }
}
</style>