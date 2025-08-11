<script setup lang="ts">
import Sidebar from '../components/Sidebar.vue';
import MetaBar from '../components/MetaBar.vue';
import { onMounted } from 'vue';
import TableItem from './TableItem.vue';

function waitForImagesToLoad(container: Element): Promise<void> {
  const images = container.querySelectorAll('img');
  const imagePromises = Array.from(images).map((img) => {
    return new Promise<void>((resolve) => {
      if (img.complete) {
        resolve();
      } else {
        img.addEventListener('load', () => resolve());
        img.addEventListener('error', () => resolve());
      }
    });
  });
  return Promise.all(imagePromises).then(() => {});
}

onMounted(async () => {
  const messages = document.querySelectorAll('.message');
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    const messageContent = message.querySelector('.message-content') as HTMLDivElement;
    const messageAuthorTimeBox = message.querySelector('.author-time-box') as HTMLDivElement;

    await waitForImagesToLoad(messageContent);

    requestAnimationFrame(() => {
      const contentWidth = messageContent.getBoundingClientRect().width;
      messageAuthorTimeBox.style.maxWidth = `${contentWidth}px`;
    });
  }
});
</script>
<template>
<Sidebar></Sidebar>
<div class="grid-container">
  <div class="metabar-container">
    <MetaBar :title="'Chats'"></MetaBar>
  </div>
  <div class="table-container" style="grid-row: 7/23; grid-column: 8/14;">
    <div class="table-header">
      <div class="table-header-icon-side-chat">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hand-coins-icon lucide-hand-coins"><path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17"/><path d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9"/><path d="m2 16 6 6"/><circle cx="16" cy="9" r="2.9"/><circle cx="6" cy="5" r="3"/></svg>
      </div>
      <div class="table-header-text-side-chat">
        Uploaded By: You
      </div>
    </div>
    <div class="table-data">
      <div class="table-list">
          <TableItem></TableItem>
      </div>
    </div>
  </div>
  <div class="table-container" style="grid-row: 24/40; grid-column: 8/14;">
    <div class="table-header">
      <div class="table-header-icon-side-chat">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-search-icon lucide-file-search"><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M4.268 21a2 2 0 0 0 1.727 1H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3"/><path d="m9 18-1.5-1.5"/><circle cx="5" cy="14" r="3"/></svg>      </div>
      <div class="table-header-text-side-chat">
        Uploaded By: Others
      </div>
    </div>
    <div class="table-data">
      <div class="table-list">
          <TableItem></TableItem>
      </div>
    </div>
  </div>
  <div class="table-container" style="grid-row: 7/40; grid-column: 15/36;">
    <div class="table-header chat-header">
      <div class="table-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-binary-icon lucide-binary"><rect x="14" y="14" width="4" height="6" rx="2"/><rect x="6" y="4" width="4" height="6" rx="2"/><path d="M6 20h4"/><path d="M14 10h4"/><path d="M6 14h2v6"/><path d="M14 4h2v6"/></svg>
      </div>
      <div class="table-header-text-container">
        <h1>Computer Science (Grade 2)</h1>
        <p>Uploaded by: John Doe</p>
      </div>
      <div class="table-header-text-container right-text-container">
        <div class="metadata-container">
          <div class="metadata-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-piggy-bank-icon lucide-piggy-bank"><path d="M11 17h3v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a3.16 3.16 0 0 0 2-2h1a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-1a5 5 0 0 0-2-4V3a4 4 0 0 0-3.2 1.6l-.3.4H11a6 6 0 0 0-6 6v1a5 5 0 0 0 2 4v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1z"/><path d="M16 10h.01"/><path d="M2 8v1a2 2 0 0 0 2 2h1"/></svg>
          </div>
          <div class="metadata-text">
            ₹110
          </div>
        </div>
        <div class="metadata-container">
          <div class="metadata-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-alert-icon lucide-book-alert"><path d="M12 13h.01"/><path d="M12 6v3"/><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>          </div>
          <div class="metadata-text">
            Like New
          </div>
        </div>      
      </div>
    </div>
    <div class="table-data">
      <div class="chat-wrapper">
        <div class="messages-wrapper">
          <div class="day-marker">
            <hr />Today<hr />
          </div>
          <div class="message message-me">
            <div class="author-time-box">
              <div class="author-box">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod dolorum, esse quaerat cum, assumenda maiores voluptate molestiae deserunt qui voluptatem optio placeat ea aut vero corporis perferendis soluta itaque. Neque?
              </div>
              <div class="time-box">
                11:59AM
              </div>
            </div>
            <div class="message-content">
              gfdgdfgdfgdfgtrgshtrgdf
            </div>
          </div>
          <div class="message message-other">
            <div class="author-time-box">
              <div class="author-box">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod dolorum, esse quaerat cum, assumenda maiores voluptate molestiae deserunt qui voluptatem optio placeat ea aut vero corporis perferendis soluta itaque. Neque?
              </div>
              <div class="time-box">
                11:59AM
              </div>
            </div>
            <div class="message-content">
              gfdgdfgdfgdfgtrgshtrgdf
            </div>
          </div>
          <div class="message message-me">
            <div class="author-time-box">
              <div class="author-box">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod dolorum, esse quaerat cum, assumenda maiores voluptate molestiae deserunt qui voluptatem optio placeat ea aut vero corporis perferendis soluta itaque. Neque?
              </div>
              <div class="time-box">
                11:59AM
              </div>
            </div>
            <div class="message-content">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Sint, voluptas odio? Ab molestiae iure itaque, consectetur et non dignissimos optio eos veniam. Sapiente officia deleniti sint dolorum quam repellendus minus?
            </div>
          </div>
          <div class="message message-me">
            <div class="author-time-box">
              <div class="author-box">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod dolorum, esse quaerat cum, assumenda maiores voluptate molestiae deserunt qui voluptatem optio placeat ea aut vero corporis perferendis soluta itaque. Neque?
              </div>
              <div class="time-box">
                11:59AM
              </div>
            </div>
            <div class="message-content">
              <img src="../assets/images/hi-res.jpeg"></img>
            </div>
          </div>
        </div>
        <div class="input-wrapper">
          <div class="input-container">
            <div class="input-box">
              <input type="text" placeholder="Write something..."></input>
            </div>
            <div class="input-btn">
              <button class="dim-btn emoji-btn"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-smile-plus-icon lucide-smile-plus"><path d="M22 11v1a10 10 0 1 1-9-10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/><path d="M16 5h6"/><path d="M19 2v6"/></svg></button>
            </div>
            <div class="input-btn">
              <button class="dim-btn attachment-btn"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-paperclip-icon lucide-paperclip"><path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551"/></svg></button>
            </div>
            <div class="input-btn">
              <button class="send-btn"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send-icon lucide-send"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>
<style lang="scss" scoped>
.grid-container {
  @extend %filler;
  display: grid;
  grid-template-columns: repeat(40, 1fr);
  grid-template-rows: repeat(40, 1fr);
  padding-left: 5vw;
  .metabar-container {
    grid-row: 1/6;
    grid-column: 8 / 36;
  }
}
.table-container {
    background-color: $color-background-secondary;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid transparentize($color: $color-accent, $amount: 0.75);
    .chat-header {
      padding: 0 1.25rem;
    }
    .table-header {
        height: 10%;
        width: 100%;
        background-color: $color-secondary-lightened;
        display: flex;
        align-items: center;
        border-top-left-radius: inherit;
        border-top-right-radius: inherit;
        font-family: 'Manrope';
        color: $color-text;
        .table-icon {
          @extend %centered;
          padding: 0.75rem;
          height: 100%;
        }
        .table-header-text-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          h1 {
            font-size: px-to-vw(20);
          }
        }
        .right-text-container {
          margin-left: auto;
          text-align: right;
          display: flex;
          justify-content: center;
          .metadata-container {
            display: flex;
            justify-content: flex-end;
            column-gap: 5px;
            .metadata-icon {
              @extend %centered;
            }
            .metadata-text {
              font-size: px-to-vw(13);
              font-family: 'Nunito';
              @extend %centered;
            }
          }
        }
        .table-header-icon-side-chat {
          width: 15%;
          height: 100%;
          @extend %centered;
        }
        .table-header-text-side-chat {
          width: 85%;
          height: 100%;
          display: flex;
          align-items: center;
          font-size: px-to-vw(13);
        }
    }
    .table-data {
      height: 90%;
      width: 100%;
      .table-list {
        width: 100%;
        height: 100%;
        list-style-type: none;
        overflow-y: scroll;
      }
      .chat-wrapper {
        position: relative;
        width: 100%;
        height: 100%;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        .messages-wrapper {
          width: 100%;
          height: 100%;
          padding-bottom: calc(10% - 1rem);
          display: flex;
          flex-direction: column;
          row-gap: 7.5px;
          overflow-y: scroll;
          .message {
            max-width: 50%;
            display: flex;
            flex-direction: column;
            font-family: 'Nunito';
            .author-time-box {
              display: flex;
              width: 100%;
              font-size: px-to-vw(12);
              justify-content: space-between;
              column-gap: 10px;
              opacity: 0.8;
              .author-box {
                max-width: 100%;
                text-overflow: ellipsis;
                text-wrap: nowrap;
                white-space: nowrap;
                overflow: hidden;
              }
              .time-box {
                display: flex;
                align-items: flex-end;
                justify-content: flex-end;
              }
            }
            .message-content {
              width: fit-content;
              max-width: 100%;
              padding: px-to-vw(10);
              border-radius: 5px;
              img {
                width: 100%;
                max-height: 300px;
                object-fit: contain;
                border-radius: 5px;
                display: block;
              }
            }
          }
          .message-me {
            align-self: flex-start;
            .message-content {
              background-color: $color-primary;
            }
          }
          .message-other {
            align-self: flex-end;
            .message-content {
              background-color: #ddd;
            }
          }
          .day-marker {
            display: flex;
            align-items: center;
            justify-content: center;
            column-gap: 10px;
            width: 100%;
            font-size: px-to-vw(14);
            font-weight: 100;
            font-family: 'Nunito';
            margin: calc(0.5vw - 7.5px) 0;
            hr {
                width: 100%;
                height: 1px;
                margin-top: px-to-vw(2.25);
                opacity: 0.5;
            }
          }
        }
        .input-wrapper {
          position: absolute;
          bottom: 0.8vw;
          left: 0;
          width: 100%;
          height: 10%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: transparent;
          .input-container {
            width: 90%;
            height: 80%;
            border-radius: 5px;
            background-color: $color-background;
            display: flex;
            padding: 0.35rem;
            .input-box {
              width: 82%;
              input {
                width: 100%;
                height: 100%;
                border: none;
                outline: none;
                background-color: transparent;
                padding: 0.25rem 1rem;
                font-family: 'Nunito';
              }
            }
            .input-btn {
              width: 6%;
              height: 100%;
              @extend %centered;
              button {
                height: 100%;
                aspect-ratio: 1/1;
                border: none;
                outline: none;
                cursor: pointer;
                @extend %centered;
              }
              .send-btn {
                background-color: $color-primary-darkened;
                border-radius: 5px;
                color: white;
              }
              .dim-btn {
                color: rgba(0, 0, 0, 0.5);
                background-color: transparent;
              }
            }
          }
        }
      }
    }
}
::-webkit-scrollbar {
  width:0;
}
</style>