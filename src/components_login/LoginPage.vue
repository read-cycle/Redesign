<script setup lang="ts">
import LoginInput from './LoginInput.vue';
import logoIcon from '../assets/icons/rc_logo.svg';
import emailIcon from '../assets/icons/email.svg?raw'
import lockIcon from '../assets/icons/lock.svg?raw'
import browse from '../assets/images/browse2.svg'
import scan from '../assets/images/scan.svg'
import texting from '../assets/images/texting.svg'
import exchange from '../assets/images/exchange.svg'
import { computed, onMounted, reactive } from 'vue';

const image_data = reactive<[string, string, boolean][]>([
  [scan, "Scan your book — we'll fetch the details.", true],
  [browse, "Browse books from nearby families.", false],
  [texting, "Message parents to coordinate exchange.", false],
  [exchange, "Exchange books in person or drop-off.", false]
]);
let counter = 0;

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
                <h1 class="login-header">Welcome Back</h1>
                <p class="login-para">Login with your email or use one of the following:</p>
              </div>

              <div class="alternatives-container">
                <button class="alt-login">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M564 325.8C564 467.3 467.1 568 324 568C186.8 568 76 457.2 76 320C76 182.8 186.8 72 324 72C390.8 72 447 96.5 490.3 136.9L422.8 201.8C334.5 116.6 170.3 180.6 170.3 320C170.3 406.5 239.4 476.6 324 476.6C422.2 476.6 459 406.2 464.8 369.7L324 369.7L324 284.4L560.1 284.4C562.4 297.1 564 309.3 564 325.8z"/></svg>
                    <div class="tooltip">Google</div>
                </button>
                <button class="alt-login">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M640 381.9C640 473.2 600.6 530.4 529.7 530.4C467.1 530.4 433.9 495.8 372.8 393.8L341.4 341.2C333.1 328.7 326.9 317 320.2 306.2C300.1 340 273.1 389.2 273.1 389.2C206.1 505.8 168.5 530.4 116.2 530.4C43.4 530.4 0 473.1 0 384.5C0 241.5 79.8 106.4 183.9 106.4C234.1 106.4 277.7 131.1 328.7 195.9C365.8 145.8 406.8 106.4 459.3 106.4C558.4 106.4 640 232.1 640 381.9zM287.4 256.2C244.5 194.1 216.5 175.7 183 175.7C121.1 175.7 69.2 281.8 69.2 385.7C69.2 434.2 87.7 461.4 118.8 461.4C149 461.4 167.8 442.4 222 357.6C222 357.6 246.7 318.5 287.4 256.2zM531.2 461.4C563.4 461.4 578.1 433.9 578.1 386.5C578.1 262.3 523.8 161.1 454.9 161.1C421.7 161.1 393.8 187 360 239.1C369.4 252.9 379.1 268.1 389.3 284.5L426.8 346.9C485.5 441 500.3 461.4 531.2 461.4z"/></svg>
                    <div class="tooltip">Meta</div>
                </button>
                <button class="alt-login">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M447.1 332.7C446.9 296 463.5 268.3 497.1 247.9C478.3 221 449.9 206.2 412.4 203.3C376.9 200.5 338.1 224 323.9 224C308.9 224 274.5 204.3 247.5 204.3C191.7 205.2 132.4 248.8 132.4 337.5C132.4 363.7 137.2 390.8 146.8 418.7C159.6 455.4 205.8 545.4 254 543.9C279.2 543.3 297 526 329.8 526C361.6 526 378.1 543.9 406.2 543.9C454.8 543.2 496.6 461.4 508.8 424.6C443.6 393.9 447.1 334.6 447.1 332.7zM390.5 168.5C417.8 136.1 415.3 106.6 414.5 96C390.4 97.4 362.5 112.4 346.6 130.9C329.1 150.7 318.8 175.2 321 202.8C347.1 204.8 370.9 191.4 390.5 168.5z"/></svg>
                    <div class="tooltip">Apple</div>

                </button>
                <button class="alt-login">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M96 96L310.6 96L310.6 310.6L96 310.6L96 96zM329.4 96L544 96L544 310.6L329.4 310.6L329.4 96zM96 329.4L310.6 329.4L310.6 544L96 544L96 329.4zM329.4 329.4L544 329.4L544 544L329.4 544L329.4 329.4z"/></svg>
                    <div class="tooltip">Microsoft</div>

                </button>
              </div>
              <div class="divider-container">
                <hr/>or<hr/>
              </div>

              <div class="login-inputs">
                <div class="login-input-wrapper">
                    <LoginInput :field-name="'Email'" :field-icon="emailIcon" :placeholder="'example@abc.com'" :is-password="false" />
                </div>
                <div class="login-input-wrapper">
                    <LoginInput :field-name="'Password'" :field-icon="lockIcon" :placeholder="'••••••••'" :is-password="true" />
                </div>
                <div class="metadata-container">
                    <div class="remember-me-container">
                        <input type="checkbox" id="remember-me-checkbox"/>
                        <label class="remember-me-text" for="remember-me-checkbox">Remember me</label>
                    </div>
                    <p class="forgot-password">Forgot Password?</p>
                </div>
              </div>
              
              <div class="login-btn-container">
                <div class="login-btn-wrapper">
                    <button class="login-btn">Login</button>
                </div>
                <p class="sign-up">Don't have an account? Sign Up</p>
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
input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  
  width: 18px;
  height: 18px;
  border: 2px solid #999;
  border-radius: 4px;
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
  top: 1px;
  left: 4.5px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
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
    aspect-ratio: 2/1;
    background-color: $color-background;
    border-radius: 30px;
    display: flex;
    overflow: hidden;
}
.text-half-login {
    width: 50%;
    height: 100%;
    display: grid;
    padding: 4rem;
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
            width: 25px;
            height: 25px;
        }
        font-size: px-to-vw(15);
    }
    .login-header-container {
        grid-row: 4/5;
        .login-header {
            font-size: 3vw;
            color: $color-accent;
        }
        .login-para {
            font-size: px-to-vw(15);
        }
    }
}
.graphic-half-login {
    width: 50%;
    height: 100%;
    padding: 0.5rem;
    .carousel-container {
        padding: 1rem;
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
        font-size: px-to-vw(14);
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
            font-size: px-to-vw(20);
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
    justify-content: space-between;
    grid-row: 11/17;
    .login-input-wrapper {
        width: 50%;
    }
    .metadata-container {
        width: 50%;
        display: flex;
        justify-content: space-between;
        .forgot-password {
            font-size: px-to-vw(14);
            color: $color-accent;
            text-decoration: underline;
            cursor: pointer;
            width: fit-content;
        }
        .remember-me-container {
            display: flex;
            align-items: center;
            column-gap: 5px;
            font-size: px-to-vw(14);
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
        svg {
            width: px-to-vw(20);
            height: px-to-vw(20);
        }
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