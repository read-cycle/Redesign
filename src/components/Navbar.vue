<template>
<div class="navbar">
    <ul class="navbar-ul">
        <li class="navbar-item header-item"><a href="" class="navbar-link"></a>ReadCycle</li>
        <li class="navbar-item"><a href="#" class="navbar-link">Home</a></li>
        <li class="navbar-item"><a href="#about-us" class="navbar-link">About Us</a></li>
        <li class="navbar-item"><a href="#how-it-works" class="navbar-link">How it Works</a></li>
        <li class="navbar-item"><a href="#contact-us" class="navbar-link">Contact Us</a></li>
        <li class="navbar-item login-item"><a href="" class="navbar-link"></a>
            <button class="login-btn">Login</button>
        </li>
    </ul>
</div>
</template>
<style lang="scss" scoped>
.navbar {
    background-color: $color-background;
    position: fixed;
    z-index: 10;
    top: 0;
    left: 0;
    width: 100%;
    height: 5rem;
    .navbar-ul {
        width: 100%;
        height: 100%;
        list-style-type: none;
        display: flex;
        align-items: center;
        .header-item {
            margin-right: auto;
            font-family: 'Nunito';
        }
        .login-item {
            margin-left: auto;
            .login-btn {
                padding: 0.75rem 2rem;
                background-color: $color-primary;
                border: 2px solid $color-background;
                border-radius: 10px;
                transition: box-shadow 0.4s ease;
                &:hover {
                    box-shadow: 0 0 0 2px $color-primary;
                }
                cursor: pointer;
            }
        }
        .navbar-item {
            padding: 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            .navbar-link {
                text-decoration: none;
                color: $color-text;
                font-family: 'Nunito';
            }
        }
    }
}
</style>