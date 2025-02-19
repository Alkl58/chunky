<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>

<style>
@media (prefers-color-scheme: dark) {
  body {
    background-color: #121212 !important;
    color: white;
  }

  .center {
    background-color: #282828 !important;
  }
}

/* Extra small devices (phones, 600px and down) */
@media only screen and (max-width: 600px) {
  .center {
    width: 80%;
  }
}

/* Small devices (portrait tablets and large phones, 600px and up) */
@media only screen and (min-width: 600px) {
  .center {
    width: 70%;
  }
}

/* Medium devices (landscape tablets, 768px and up) */
@media only screen and (min-width: 768px) {
  .center {
    width: 60%;
  }
}

/* Large devices (laptops/desktops, 992px and up) */
@media only screen and (min-width: 992px) {
  .center {
    width: 50%;
  }
}

/* Extra large devices (large laptops and desktops, 1200px and up) */
@media only screen and (min-width: 1200px) {
  .center {
    width: 40%;
  }
} 

@media only screen and (min-width: 1400px) {
  .center {
    width: 30%;
  }
} 

@media only screen and (min-width: 1800px) {
  .center {
    width: 20%;
  }
} 


body {
  font-family: Arial, sans-serif;
}

.center {
  position: absolute;
  left: 50%;
  top: 50%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  background-color: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 5px 10px 0 rgba(0, 0, 0, 0.3);
}

h1 {
  text-align: center;
}


input[type="file"] {
  width: 100%;
  text-align: center;
}

input[type="file"]::file-selector-button, .upload-button {
  padding: 1em 1.5em;
  border-width: 0;
  border-radius: 10px;
  background-color: dodgerblue;
  color: #FFFFFF;
  font-weight: bold;
  transition: all .25s ease-in-out;
  cursor: pointer;
}

.upload-button {
  float: right;
  background-color: #29b586;
}

input[type="file"]::file-selector-button:hover {
  background-color: rgb(73, 164, 255);
}

.upload-button:hover {
  background-color: #2dc793;
}

.upload-button:disabled {
  background-color: grey;
  cursor: not-allowed;
}

ul {
  list-style: none;
  padding: 0;
}

.file {
  border: 1px dashed #ccc;
  padding: 1em;
  margin-bottom: 0.5em;
  border-radius: 10px;
}

.file h2 {
  font-size: initial;
  margin-top: 0;
  margin-bottom: 0;
}

.file p {
  margin-bottom: 0;
}

.message {
  background-color: #29b586;
  border-radius: 10px;
  padding: 5px;
  color: white;
  width: 100%;
  margin-bottom: 10px;
  text-align: center;
}

.message-error {
  background-color: #c2412a
}

.message:first-child {
  font-weight: bold;
}

.container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.container > img {
  height: 44px;
}
</style>