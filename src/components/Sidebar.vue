<script setup lang="ts">
import { signOut } from 'firebase/auth';
import logo from '../assets/icons/rc_logo.svg?raw'
import { auth } from '../firebase-init';
import router from '../router';
const logout = async () => {
  try {
    await signOut(auth);
    router.push('/login');
  } catch (error) {
    console.error('Error signing out:', error);
  }
};
</script>
<template>
    <div class="sidebar">
        <ul class="sidebar-items">
            <div class="sidebar-group">
                <li class="sidebar-item">
                    <div class="sidebar-icon sidebar-header-icon" v-html="logo"></div>
                    <h1 class="sidebar-text sidebar-header-text">ReadCycle</h1>
                </li>
            </div>
            <div class="sidebar-group">
                <li class="sidebar-item">
                    <div class="sidebar-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layout-dashboard-icon lucide-layout-dashboard"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                    </div>
                    <router-link to="/dashboard" class="sidebar-text" active-class="active-link" exact>
                      Dashboard
                    </router-link>                
                </li>
                <li class="sidebar-item">
                    <div class="sidebar-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-search2-icon lucide-file-search-2"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><circle cx="11.5" cy="14.5" r="2.5"/><path d="M13.3 16.3 15 18"/></svg>
                    </div>
                    <router-link to="/browser" class="sidebar-text" active-class="active-link" exact>
                      Browse Books
                    </router-link>                   
                </li>
                <li class="sidebar-item">
                    <div class="sidebar-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-upload-icon lucide-upload"><path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>
                    </div>
                    <router-link to="/upload" class="sidebar-text" active-class="active-link" exact>
                      Upload Books
                    </router-link>                   
                </li>
                <li class="sidebar-item">
                    <div class="sidebar-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square-icon lucide-message-square"><path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/></svg>
                    </div>
                    <router-link to="/chats" class="sidebar-text" active-class="active-link" exact>
                      Chats
                    </router-link>                   
                </li>
            </div>
            <div class="sidebar-group">
                <label class="sidebar-label">Tools</label>
                <li class="sidebar-item">
                    <div class="sidebar-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-settings"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>                        
                    </div>
                    <a class="sidebar-text">Settings</a>
                </li>
                <li class="sidebar-item" @click="logout">
                    <div class="sidebar-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    </div>
                    <a class="sidebar-text">Log Out</a>
                </li>
            </div>
        </ul>
    </div>
</template>

<style lang="scss" scoped>
.sidebar {
  @extend %centered;
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100px;
  background-color: $color-background-secondary;
  flex-direction: column;
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
  overflow: hidden;
  transition: width 0.3s ease;
  z-index: 10;

  .sidebar-items {
    @extend %filler;
    position: relative;
    border-radius: inherit;

    .sidebar-group {
      width: 100%;
      padding-top: 18px;
      padding-left: 18px;
      padding-right: 18px;

      &:last-child {
        position: absolute;
        bottom: 0;
      }

      .sidebar-label {
        font-family: 'Nunito';
        font-weight: 500;
        color: #6c757d;
        opacity: 0;
        white-space: nowrap;
        transition: opacity 0.2s ease;
      }

      .sidebar-item {
        display: flex;
        align-items: center;
        column-gap: 15px;
        list-style-type: none;
        width: 100%;
        padding: 18px;
        cursor: pointer;

        &:hover {
          .sidebar-icon {
            svg {
              color: $color-primary-darkened;
            }
          }
        }

        .sidebar-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          svg {
            transition: color 1s ease-in-out;
            color: lightgrey;
            width: 25px;
            aspect-ratio: 1/1;
          }
        }

        .sidebar-text {
          font-family: 'Nunito';
          font-weight: 250;
          opacity: 0;
          white-space: nowrap;
          transition: opacity 0.2s ease;
          color: $color-text;
          text-decoration: none;
        }
      }
      .sidebar-header-icon {
        width: 25px;
        height: 25px;
        justify-content: center;
      }
      .sidebar-header-text {
        font-family: 'Manrope' !important;
        font-weight: 400 !important;
        color: $color-accent !important;
      }
    }
  }

  &:hover {
    width: 300px;
    .sidebar-label,
    .sidebar-text {
      opacity: 1 !important;
    }
  }
}
</style>