// src/services/docConfig.ts
export const DOC_FIREBASE_CONFIG = {
  storageBucket: 'sebastian-cafe.firebasestorage.app',
  
  // Direct URL format for individual menu files (matching your website app logic)
  getMenuFileUrl(menuId: string) {
    const fileName = `menu-${menuId}.json`;
    return `https://firebasestorage.googleapis.com/v0/b/${this.storageBucket}/o/menus%2F${encodeURIComponent(fileName)}?alt=media`;
  }
};