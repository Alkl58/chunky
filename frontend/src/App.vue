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

  .form {
    background-color: #282828 !important;
  }
}

/* Extra small devices (phones, 600px and down) */
@media only screen and (max-width: 600px) {
  .form {
    width: 80%;
  }
}

/* Small devices (portrait tablets and large phones, 600px and up) */
@media only screen and (min-width: 600px) {
  .form {
    width: 70%;
  }
}

/* Medium devices (landscape tablets, 768px and up) */
@media only screen and (min-width: 768px) {
  .form {
    width: 60%;
  }
}

/* Large devices (laptops/desktops, 992px and up) */
@media only screen and (min-width: 992px) {
  .form {
    width: 50%;
  }
}

/* Extra large devices (large laptops and desktops, 1200px and up) */
@media only screen and (min-width: 1200px) {
  .form {
    width: 40%;
  }
} 

@media only screen and (min-width: 1400px) {
  .form {
    width: 30%;
  }
} 

@media only screen and (min-width: 1800px) {
  .form {
    width: 20%;
  }
} 


body {
  font-family: Arial, sans-serif;
}

.center {
  display: flex;
  align-items: center;
  justify-content: center;
  width: auto;
  height: 90vh;
}

.form {
  background-color: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 5px 10px 0 rgba(0, 0, 0, 0.3);
  max-height: 80vh;
  overflow-y: scroll;
  overflow-x: clip;
}

h1 {
  text-align: center;
}

input[type="file"] {
  width: 100%;
  text-align: center;
}

input[type="file"]::file-selector-button, .upload-button {
  padding: 0.5em 1.0em;
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
  border: 1px solid #121212;
  padding: 1em;
  margin-bottom: 0.5em;
  border-radius: 10px;
  box-shadow: 0 5px 10px 0 rgba(0, 0, 0, 0.3);
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