// db.ts
import Dexie, { type EntityTable } from "dexie";

export interface TDocumentMetadata {
  id: number;
  documentId: string;
  lightPreviewImage: string;
  darkPreviewImage: string;
}

const db = new Dexie("documents") as Dexie & {
  documents: EntityTable<
    TDocumentMetadata,
    "id" // primary key "id" (for the typings only)
  >;
};

// Schema declaration:
db.version(1).stores({
  documents: "++id, documentId, lightPreviewImage, darkPreviewImage", // primary key "id" (for the runtime!)
});

export { db };
