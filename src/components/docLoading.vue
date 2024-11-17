<template>
  <div class="loading">
    <div></div>
    <div></div>
    <div></div>
  </div>
</template>

<style lang="scss" scoped>
.loading,
.loading>div {
  position: relative;
  box-sizing: border-box;
}

.loading {
  display: block;
  font-size: 0;
  color: rgba(147, 159, 174, 1);
}

.loading.la-dark {
  color: rgba(147, 159, 174, 0.1);
}

.loading>div {
  display: inline-block;
  float: none;
  background-color: currentColor;
  border: 0 solid currentColor;
}

.loading {
  width: 54px;
  height: 100%;
  display: flex;
  align-items: center;
}

.loading>div {
  width: 8px;
  height: 8px;
  margin: 0 4px;
  border-radius: 100%;
  opacity: 0;
  animation: ball-fall 1s ease-in-out infinite;
}

.loading>div:nth-child(1) {
  animation-delay: -200ms;
}

.loading>div:nth-child(2) {
  animation-delay: -100ms;
}

.loading>div:nth-child(3) {
  animation-delay: 0ms;
}

@keyframes ball-fall {
  0% {
    opacity: 0;
    transform: translateY(-145%);
  }

  10% {
    opacity: 0.5;
  }

  20% {
    opacity: 1;
    transform: translateY(0);
  }

  80% {
    opacity: 1;
    transform: translateY(0);
  }

  90% {
    opacity: 0.5;
  }

  100% {
    opacity: 0;
    transform: translateY(145%);
  }
}
</style>
