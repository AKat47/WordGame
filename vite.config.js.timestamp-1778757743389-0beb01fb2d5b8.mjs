// vite.config.js
import { defineConfig } from "file:///sessions/funny-eager-sagan/mnt/word-garden/node_modules/vite/dist/node/index.js";
import react from "file:///sessions/funny-eager-sagan/mnt/word-garden/node_modules/@vitejs/plugin-react/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [react()],
  cacheDir: "/tmp/vite-word-garden",
  server: {
    proxy: {
      // Forward /api/* from Vite dev server → Express on port 3001
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvc2Vzc2lvbnMvZnVubnktZWFnZXItc2FnYW4vbW50L3dvcmQtZ2FyZGVuXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvc2Vzc2lvbnMvZnVubnktZWFnZXItc2FnYW4vbW50L3dvcmQtZ2FyZGVuL3ZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9zZXNzaW9ucy9mdW5ueS1lYWdlci1zYWdhbi9tbnQvd29yZC1nYXJkZW4vdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gIGNhY2hlRGlyOiBcIi90bXAvdml0ZS13b3JkLWdhcmRlblwiLFxuICBzZXJ2ZXI6IHtcbiAgICBwcm94eToge1xuICAgICAgLy8gRm9yd2FyZCAvYXBpLyogZnJvbSBWaXRlIGRldiBzZXJ2ZXIgXHUyMTkyIEV4cHJlc3Mgb24gcG9ydCAzMDAxXG4gICAgICBcIi9hcGlcIjoge1xuICAgICAgICB0YXJnZXQ6ICAgICAgIFwiaHR0cDovL2xvY2FsaG9zdDozMDAxXCIsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFtVCxTQUFTLG9CQUFvQjtBQUNoVixPQUFPLFdBQVc7QUFFbEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLEVBQ2pCLFVBQVU7QUFBQSxFQUNWLFFBQVE7QUFBQSxJQUNOLE9BQU87QUFBQTtBQUFBLE1BRUwsUUFBUTtBQUFBLFFBQ04sUUFBYztBQUFBLFFBQ2QsY0FBYztBQUFBLE1BQ2hCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
