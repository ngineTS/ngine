CREATE SCHEMA "ngine";

CREATE TABLE IF NOT EXISTS "ngine"."navigation" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "groupId" uuid,
  "parentGroupId" uuid,
  "name" varchar(100),
  "displayLabel" varchar(100),
  "description" varchar,
  "order" int,
  "isDisabled" boolean,
  "navigationTypeId" uuid,
  "icon" varchar(100),
  "showIconOnly" boolean,
  "url" varchar,
  "isDraft" boolean,
  "unpublishedChanges" varchar(255)[],
  "createdBy" uuid,
  "createdDate" timestamp,
  "updatedBy" uuid,
  "updatedDate" timestamp,
  "deletedBy" uuid,
  "deletedDate" timestamp
);

CREATE INDEX idx_navigation_not_deleted
ON "ngine"."navigation"
USING btree ("parentGroupId")
WHERE "deletedDate" IS NULL;

CREATE TABLE IF NOT EXISTS "ngine"."navigation_type" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" varchar(100) UNIQUE,
  "displayLabel" varchar(100),
  "description" varchar(255),
  "thumbnailImage" varchar
);

CREATE TABLE IF NOT EXISTS "ngine"."quill_editor" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "navigationId" uuid,
  "content" varchar,
  "fileName" varchar
);

CREATE TABLE IF NOT EXISTS "ngine"."calendar" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "navigationId" uuid,
  "startDate" timestamp,
  "endDate" timestamp,
  "description" varchar,
  "title" varchar(100),
  "fileId" varchar,
  "category" varchar(100),
  "url" varchar,
  "allDay" boolean
);

CREATE TABLE IF NOT EXISTS "ngine"."media"(
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" varchar,
  "displayLabel" varchar(255),
  "type" varchar(255),
  "createdBy" uuid,
  "createdDate" timestamp,
  "updatedBy" uuid,
  "updatedDate" timestamp,
  "deletedBy" uuid,
  "deletedDate" timestamp
);

CREATE TABLE IF NOT EXISTS "ngine"."table_viz"(
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "navigationId" uuid,
  "tableName" varchar(255),
  "tableLabel" varchar(255),
  "isEditable" boolean
);

CREATE TABLE IF NOT EXISTS "ngine"."user" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" varchar(255),
  "lastName" varchar(255),
  "emailAddress" varchar(255),
  "password" varchar(255),
  "isDisabled" boolean DEFAULT FALSE,
  "createdBy" uuid,
  "createdDate" timestamp,
  "updatedBy" uuid,
  "updatedDate" timestamp,
  "deletedBy" uuid,
  "deletedDate" timestamp
);

CREATE TABLE IF NOT EXISTS "ngine"."password_recovery" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
	"emailAddress" varchar(100) NULL,
	"token" varchar NULL,
	"createdDate" timestamp NULL
);

CREATE TABLE IF NOT EXISTS "ngine"."role" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
	"name" varchar(255),
	"displayLabel" varchar(255),
	"description" varchar(1000),
	"isDisabled" boolean,
	"createdBy" uuid,
	"createdDate" timestamp,
	"updatedBy" uuid,
	"updatedDate" timestamp,
	"deletedBy" uuid,
	"deletedDate" timestamp
);

CREATE TABLE IF NOT EXISTS "ngine"."permission" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
	"name" varchar(255),
	"priority" int,
	"createdBy" uuid,
	"createdDate" timestamp,
	"updatedBy" uuid,
	"updatedDate" timestamp,
	"deletedBy" uuid,
	"deletedDate" timestamp
);

CREATE TABLE IF NOT EXISTS "ngine"."role_navigation_permission" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
	"roleId" uuid NOT NULL,
	"navigationGroupId" uuid,
	"permissionId" uuid NOT NULL,
	"createdBy" uuid,
	"createdDate" timestamp,
	"updatedBy" uuid,
	"updatedDate" timestamp,
	"deletedBy" uuid,
	"deletedDate" timestamp
);

CREATE TABLE IF NOT EXISTS "ngine"."user_role" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
	"userId" uuid,
	"roleId" uuid,
	"stripeSubscriptionId" varchar,
    "isCancelled" boolean,
	"createdBy" uuid,
	"createdDate" timestamp,
	"updatedBy" uuid,
	"updatedDate" timestamp,
	"deletedBy" uuid,
	"deletedDate" timestamp
);

CREATE TABLE IF NOT EXISTS "ngine"."user_event" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
	"userId" uuid,
	"sessionId" varchar(255),
	"url" varchar(1024),
	"date" timestamp
);

CREATE TABLE IF NOT EXISTS "ngine"."container_layout" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
	"refId" uuid,
	"width" numeric(6,2),
	"height" numeric(6,2),
	"marginTop" int,
	"marginRight" int,
	"marginBottom" int,
	"marginLeft" int,
	"paddingTop" int,
	"paddingRight" int,
	"paddingBottom" int,
	"paddingLeft" int,
    "xPos" numeric(6,2),
    "yPos" numeric(6,2),
	"zIndex" integer,
	"heightFitContent" boolean
);
	
CREATE TABLE IF NOT EXISTS "ngine"."container_style" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
	"refId" uuid,
	"backgroundColor" varchar(10),
	"borderColor" varchar(10),
	"borderStyle" varchar(10),
	"borderWidth" int,
	"borderTopLeftRadius" int,
	"borderTopRightRadius" int,
	"borderBottomLeftRadius" int,
	"borderBottomRightRadius" int,
	"isBorderTopHidden" boolean,
	"isBorderRightHidden" boolean,
	"isBorderBottomHidden" boolean,
	"isBorderLeftHidden" boolean,
	"backgroundImage" varchar,
	"isBackgroundTransparent" boolean
);

CREATE TABLE IF NOT EXISTS "ngine"."typography_style" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    "refId" uuid,
	"fontFamily" varchar(100),
	"fontSize" int,
	"fontWeight" int,
	"color" varchar(10),
	"activeColor" varchar(10)
);

CREATE TABLE IF NOT EXISTS "ngine"."menu" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
	"navigationId" uuid,
    "isVertical" boolean
);

CREATE TABLE IF NOT EXISTS "ngine"."app_setting" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "settingName" varchar(255),
  "settingValue" varchar(250)
);

CREATE TABLE IF NOT EXISTS "ngine"."reusable_card" (
	"id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
	"navigationId" uuid,
	"name" varchar,
	"icon" varchar,
	"description" varchar,
	"order" int
);
CREATE INDEX idx_reusable_card_order ON ngine.reusable_card ("order" ASC);

CREATE TABLE IF NOT EXISTS "ngine"."auth_pack" (
	"id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
	"navigationId" uuid not null,
	"name" varchar not null CHECK ("name" <> ''),
	"description" varchar not null CHECK ("name" <> ''),
	"roleId" uuid not null,
	"stripePriceId" varchar,
	"price" float4,
	"currency" varchar,
	"isFree" boolean,
	"isRecurringPayment" boolean,
	"interval" varchar,
	"order" int
);
CREATE INDEX idx_auth_pack_order ON ngine.auth_pack ("order" ASC);

CREATE TABLE IF NOT EXISTS "ngine"."banner" (
	"id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
	"navigationId" uuid NOT NULL,
	"description" varchar NOT NULL,
	"backgroundColor" varchar(16) NOT NULL,
	"textColor" varchar(16) NOT NULL,
	"startDate" timestamp NOT NULL,
	"endDate" timestamp NOT NULL,
	"url" varchar
);
CREATE INDEX idx_banner_start_date ON ngine.banner ("startDate" DESC);

-- Insert navigation types
INSERT INTO "ngine"."navigation_type" ("id", "name", "displayLabel", "description", "thumbnailImage")
VALUES ('efb83d84-50e9-4749-9ae9-b695dd47725e', 'dialog-button', 'Dialog Button', 'Open a dialog on click.', 'dialog-button.png'),
	('b582109c-4698-4177-9625-8a453dc7602a', 'external-link-button', 'External Link Button', 'Open url on new page on click.', 'external-link-button.png'),
	('0a684eed-fca8-4341-92f4-03bb8164eb0c', 'redirect-button', 'Redirect Button', 'Navigate to route name on click.', 'redirect-button.png'),
	('18d854ec-cb82-4757-b089-2b99277bbfe3', 'menu-button', 'Menu Button', 'Open a menu on click.', 'menu-button.png'),
	('99a201f1-1e1a-4658-8e85-1f3f93ac3a1d', 'role-management', 'Role Management', 'Manage your roles.', 'role-management.png'),
	('4dcbdfb1-0c02-44f4-ad2f-d71e34631496', 'user-management', 'User Management', 'Manage your users.', 'user-management.png'),
	('224a2cf9-08a6-4239-8334-a4160d69d14f', 'media-library', 'Media Library', 'Find and manage all the files uploaded.', 'media-library.png'),
	('7185d7b4-b0b6-4a26-996c-1b52c2099f4a', 'analytic', 'Analytic', 'Find essential metrics related to your aplplication.', 'analytic.png'),
	('83b9cc4d-c3f4-4ee0-a278-3a44a2289fe5', 'content-visualization', 'Content Visualization', 'Visualize your tables.', 'table-viz.png'),
	('2028fb3f-1821-4db5-b027-ada0fa39704e', 'calendar', 'Calendar', 'Publish information into a calendar including text, files...', 'calendar.png'),
	('e7101e0c-93ed-497a-af60-af7974e2d871', 'my-quill-editor', 'Text Editor', 'Text editor to post information.', 'quill-editor.png'),
	('83b42cac-968a-4e98-865c-bed6dd18a76b', 'sign-container', 'User Authentication', 'Sign-in / Sign-up form', 'sign-container.png'),
    ('c48f8021-190c-4f32-8beb-3a940fb383da', 'simple-shape', 'Simple shape', 'A simple shape that can contains text and picture.', 'simple-shape.png'),
	('c21c2b93-1967-4978-8a24-7d10f6349eb1', 'media', 'Media', 'video, image, audio, documents...', 'media-default.png'),
	('9194a5b5-2597-492c-935b-a192b67369e2', 'reusable-card-list', 'Reusable card list', 'A simple item management feature that allows users to add, edit, delete, and reorder items.', 'card-list.png'),
    ('1b2441bf-b18f-4e3b-a506-28b5a9838b0b', 'authentication-management', 'Custom Authentication Popup', 'Custom your autentication popup by conneting your app to Stripe and propose paid packs to your users.', 'custom-auth-popup.png'),
    ('d98662f9-4da8-4326-b453-904e13930b67', 'banner-management', 'Banner Management', 'Show important information to your users in the different sections of the application.', 'banner.png'),
	('a026a40f-c125-4559-b231-ede8f8885a9e', 'ngine-guide', 'Ngine Guide', 'The startup guide of Ngine.', 'ngine-guide.png');

-- insert navigation starter pack
INSERT INTO "ngine"."navigation" ("id", "groupId", "parentGroupId", "name", "displayLabel", "description", "order", "isDisabled", "navigationTypeId", "icon", "showIconOnly", "isDraft", "unpublishedChanges")
VALUES ('b9c9307f-aed2-4a33-9d2f-16df48213d6f', '5249f156-856e-4d3c-817b-f5b409b9dc05', '870e1bd0-32cd-48a1-a579-895026599390', 'banner-management-component', 'Banner Management Component', '', 0, false, 'd98662f9-4da8-4326-b453-904e13930b67', '', false, false, '{}'),
('e625457f-ce9e-495c-9438-d0732d076381', '5249f156-856e-4d3c-817b-f5b409b9dc05', '870e1bd0-32cd-48a1-a579-895026599390', 'banner-management-component', 'Banner Management Component', '', 0, false, 'd98662f9-4da8-4326-b453-904e13930b67', '', false, true, '{}'),
('85478b2b-ef2c-4389-947a-5e16e8b839f6', 'e2ad89ae-ef49-4dca-ac9d-7ed88c4104a6', '9087dfea-d9a4-491c-8635-b1ebbb4e466c', 'role-management-component', 'Role Management Component', '', 0, false, '99a201f1-1e1a-4658-8e85-1f3f93ac3a1d', '', false, false, '{}'),
('9830d6b5-aca3-4d9b-905d-3d51846687e4', '33aa1a39-e1aa-421b-9056-5ef15bc93069', '00000000-0000-0000-0000-000000000000', 'welcome', 'WELCOME', '', 1, false, '0a684eed-fca8-4341-92f4-03bb8164eb0c', '', false, false, '{}'),
('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', NULL, 'global', 'Global', '', 0, false, '0a684eed-fca8-4341-92f4-03bb8164eb0c', '', false, false, '{}'),
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', NULL, 'global', 'Global', '', 0, false, '0a684eed-fca8-4341-92f4-03bb8164eb0c', '', false, true, '{}'),
('8932e561-c5e0-4529-9a55-647f52fddbfd', '33aa1a39-e1aa-421b-9056-5ef15bc93069', '00000000-0000-0000-0000-000000000000', 'welcome', 'WELCOME', '', 1, false, '0a684eed-fca8-4341-92f4-03bb8164eb0c', '', false, true, '{}'),
('44752735-64eb-4227-a193-65dabd717376', 'aa045401-2f35-4c36-8419-5d46a20e5646', '00000000-0000-0000-0000-000000000000', 'settings', 'Settings', '', 0, false, '0a684eed-fca8-4341-92f4-03bb8164eb0c', 'gear', true, false, '{}'),
('7785a65d-f043-47ab-8a6c-7a1aac6c0e75', '7db81045-2e29-4c0e-a7d1-2823756054b0', 'c2940739-8588-4d0c-91c6-d117383610b8', 'file-management-component', 'File Management Component', '', 0, false, '224a2cf9-08a6-4239-8334-a4160d69d14f', '', false, true, '{}'),
('1fc46cda-1de0-44b3-8203-0a2d0f410d99', 'caa43c11-abaf-4c40-b326-57a4e0df17a6', '9ce096e5-8f9d-4bd8-bbad-c17006b6eeff', 'analytic-component', 'Analytic Component', '', 0, false, '7185d7b4-b0b6-4a26-996c-1b52c2099f4a', '', false, true, '{}'),
('59461626-4489-499b-a0c0-f4262c3c8fbb', 'aa045401-2f35-4c36-8419-5d46a20e5646', '00000000-0000-0000-0000-000000000000', 'settings', 'Settings', '', 0, false, '0a684eed-fca8-4341-92f4-03bb8164eb0c', 'gear', true, true, '{}'),
('11faca8f-db6c-4a71-ab9b-e93879e648c5', '44cd4b66-0dfe-4667-82f6-60298f772c05', '7e1104e1-2993-4533-88e0-60c9e264b639', 'user-management-component', 'User Management Component', '', 0, false, '4dcbdfb1-0c02-44f4-ad2f-d71e34631496', '', false, true, '{}'),
('25cf1e16-b4d7-4c52-b469-abc0ba8036a4', '9087dfea-d9a4-491c-8635-b1ebbb4e466c', '7652a0eb-ac07-4a64-938f-8bf6a58b8dbc', 'role-management', 'Role Management', '', 0, false, '0a684eed-fca8-4341-92f4-03bb8164eb0c', '', false, true, '{}'),
('0c6715e2-7326-4dba-9ce0-c54fc49453c1', '3fe7839f-add8-48df-89f4-7e82ced0f2e0', '087c4311-0abd-4337-bc35-d7935448bfb8', 'ng-guide', 'Ng guide', '', 0, false, 'a026a40f-c125-4559-b231-ede8f8885a9e', '', false, false, '{}'),
('365ca69b-8ae5-491c-b513-c829c6df8ec3', '7e1104e1-2993-4533-88e0-60c9e264b639', '7652a0eb-ac07-4a64-938f-8bf6a58b8dbc', 'user-management', 'User Management', '', 1, false, '0a684eed-fca8-4341-92f4-03bb8164eb0c', '', false, true, '{}'),
('e88be9ca-1c57-4794-8ae9-ed1b7e44a2ac', '3fe7839f-add8-48df-89f4-7e82ced0f2e0', '087c4311-0abd-4337-bc35-d7935448bfb8', 'ng-guide', 'Ng guide', '', 0, false, 'a026a40f-c125-4559-b231-ede8f8885a9e', '', false, true, '{}'),
('bf49a8cd-6037-474c-a48c-967ba992016c', '7e1104e1-2993-4533-88e0-60c9e264b639', '7652a0eb-ac07-4a64-938f-8bf6a58b8dbc', 'user-management', 'User Management', '', 1, false, '0a684eed-fca8-4341-92f4-03bb8164eb0c', '', false, false, '{}'),
('ae9ce253-d962-4fe7-a90f-f8d5ba19d6df', 'e2ad89ae-ef49-4dca-ac9d-7ed88c4104a6', '9087dfea-d9a4-491c-8635-b1ebbb4e466c', 'role-management-component', 'Role Management Component', '', 0, false, '99a201f1-1e1a-4658-8e85-1f3f93ac3a1d', '', false, true, '{}'),
('1f510dce-c50b-4e6c-8545-c0936486c51b', '9087dfea-d9a4-491c-8635-b1ebbb4e466c', '7652a0eb-ac07-4a64-938f-8bf6a58b8dbc', 'role-management', 'Role Management', '', 0, false, '0a684eed-fca8-4341-92f4-03bb8164eb0c', '', false, false, '{}'),
('a497c269-c0c8-4e7c-95dd-4aed27a7833e', '44cd4b66-0dfe-4667-82f6-60298f772c05', '7e1104e1-2993-4533-88e0-60c9e264b639', 'user-management-component', 'User Management Component', '', 0, false, '4dcbdfb1-0c02-44f4-ad2f-d71e34631496', '', false, false, '{}'),
('c031cab8-d931-4218-b349-627d1acad882', 'caa43c11-abaf-4c40-b326-57a4e0df17a6', '9ce096e5-8f9d-4bd8-bbad-c17006b6eeff', 'analytic-component', 'Analytic Component', '', 0, false, '7185d7b4-b0b6-4a26-996c-1b52c2099f4a', '', false, false, '{}'),
('02833b49-aad8-4f52-8fc4-3d9f580fd254', '7db81045-2e29-4c0e-a7d1-2823756054b0', 'c2940739-8588-4d0c-91c6-d117383610b8', 'file-management-component', 'File Management Component', '', 0, false, '224a2cf9-08a6-4239-8334-a4160d69d14f', '', false, false, '{}'),
('eee27b5b-b426-49a9-854c-a52160bc2286', '087c4311-0abd-4337-bc35-d7935448bfb8', 'aa045401-2f35-4c36-8419-5d46a20e5646', 'user-guide', 'User Guide', 'Ngine Starter Guide', 0, false, '0a684eed-fca8-4341-92f4-03bb8164eb0c', 'book', true, false, '{}'),
('33c3c4d7-2983-497b-b0ea-7ab817b46749', '087c4311-0abd-4337-bc35-d7935448bfb8', 'aa045401-2f35-4c36-8419-5d46a20e5646', 'user-guide', 'User Guide', 'Ngine Starter Guide', 0, false, '0a684eed-fca8-4341-92f4-03bb8164eb0c', 'book', true, true, '{}'),
('ffe20a73-77a4-4317-ade3-841a5407f593', 'c2940739-8588-4d0c-91c6-d117383610b8', 'aa045401-2f35-4c36-8419-5d46a20e5646', 'file-management', 'File Management', 'File Management', 2, false, '0a684eed-fca8-4341-92f4-03bb8164eb0c', 'folder', true, false, '{}'),
('e094e815-2639-4962-be08-4a2b0e553fe2', '870e1bd0-32cd-48a1-a579-895026599390', 'aa045401-2f35-4c36-8419-5d46a20e5646', 'banner-management', 'Banner Management', 'Banners & Communication', 3, false, '0a684eed-fca8-4341-92f4-03bb8164eb0c', 'megaphone', true, false, '{}'),
('5291de96-f46b-4e80-83e6-c3189f1e27bb', '870e1bd0-32cd-48a1-a579-895026599390', 'aa045401-2f35-4c36-8419-5d46a20e5646', 'banner-management', 'Banner Management', 'Banners & Communication', 3, false, '0a684eed-fca8-4341-92f4-03bb8164eb0c', 'megaphone', true, true, '{}'),
('1189e9fe-ed35-429b-bf07-c7a8afff60fb', '9ce096e5-8f9d-4bd8-bbad-c17006b6eeff', 'aa045401-2f35-4c36-8419-5d46a20e5646', 'analytic', 'Analytic', 'Application Analytics', 4, false, '0a684eed-fca8-4341-92f4-03bb8164eb0c', 'graph-up-arrow', true, false, '{}'),
('e97aaef6-14fa-4fb5-a7d9-2d4caf666737', '9ce096e5-8f9d-4bd8-bbad-c17006b6eeff', 'aa045401-2f35-4c36-8419-5d46a20e5646', 'analytic', 'Analytic', 'Application Analytics', 4, false, '0a684eed-fca8-4341-92f4-03bb8164eb0c', 'graph-up-arrow', true, true, '{}'),
('1fe7664d-f986-4057-8c71-8ce4a5703b9d', '7652a0eb-ac07-4a64-938f-8bf6a58b8dbc', 'aa045401-2f35-4c36-8419-5d46a20e5646', 'user-role-management', 'User Role Management', 'User Role Management', 1, false, '0a684eed-fca8-4341-92f4-03bb8164eb0c', 'person-gear', true, false, '{}'),
('342e67ed-88ff-43fd-bc31-ad9671297825', '7652a0eb-ac07-4a64-938f-8bf6a58b8dbc', 'aa045401-2f35-4c36-8419-5d46a20e5646', 'user-role-management', 'User Role Management', 'User Role Management', 1, false, '0a684eed-fca8-4341-92f4-03bb8164eb0c', 'person-gear', true, true, '{}'),
('002e0dea-430a-4939-b099-ad17a975d17a', 'c2940739-8588-4d0c-91c6-d117383610b8', 'aa045401-2f35-4c36-8419-5d46a20e5646', 'file-management', 'File Management', 'File Management', 2, false, '0a684eed-fca8-4341-92f4-03bb8164eb0c', 'folder', true, true, '{}');

-- Insert menu starter pack
INSERT INTO "ngine"."menu" ("id", "navigationId", "isVertical")
VALUES ('25a51a84-a7e5-45c6-aef2-7718b02b9e9e', '11111111-1111-1111-1111-111111111111', false),
('37d82b67-b2a8-4a03-afa1-148cda5fc343', '59461626-4489-499b-a0c0-f4262c3c8fbb', true),
('04f3a568-8741-4a11-ae0b-3b63241b7563', '00000000-0000-0000-0000-000000000000', false),
('553062fc-8222-4976-875f-d97096e1df41', '44752735-64eb-4227-a193-65dabd717376', true),
('4c6deab0-86c9-4379-aebc-da81308f4f6b', '342e67ed-88ff-43fd-bc31-ad9671297825', false),
('1a1d82a8-1c2f-4d86-ad81-181493e26359', '1fe7664d-f986-4057-8c71-8ce4a5703b9d', false);

-- Insert container layout pack
INSERT INTO "ngine"."container_layout" ("id", "refId", "width", "height", "marginTop", "marginRight", "marginBottom", "marginLeft", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "xPos", "yPos", "zIndex", "heightFitContent")
VALUES ('1a8ecf3c-32e9-47de-b136-8de9740ddb29', '59461626-4489-499b-a0c0-f4262c3c8fbb', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, -59.00, NULL, NULL, NULL),
('f6637cf5-adf3-49e9-a482-9b447e78e708', '25a51a84-a7e5-45c6-aef2-7718b02b9e9e', 100.00, 75.00, 50, 100, 20, 100, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('eb8b1f69-c4ab-4d0f-a678-a685ccd2425f', '8932e561-c5e0-4529-9a55-647f52fddbfd', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 9.00, NULL, NULL, NULL),
('3cc3c94f-4655-4895-95f7-c8f27532e7de', 'e625457f-ce9e-495c-9438-d0732d076381', 79.20, 21.20, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, 0.55, 1.32, NULL, true),
('84755347-79d5-4339-acec-b6b9955c89bd', '04f3a568-8741-4a11-ae0b-3b63241b7563', 100.00, 75.00, 50, 100, 20, 100, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('b501ced7-0a9c-4226-9c9a-98d2d2ace4c2', '9830d6b5-aca3-4d9b-905d-3d51846687e4', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 9.00, NULL, NULL, NULL),
('bc3987bf-058e-4262-943f-334fdbdb8e2d', '44752735-64eb-4227-a193-65dabd717376', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, -59.00, NULL, NULL, NULL),
('22bada94-7b9d-4076-9535-c1af3dd9d3c2', 'b9c9307f-aed2-4a33-9d2f-16df48213d6f', 79.20, 21.20, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, 0.55, 1.32, NULL, true),
('186cf8ec-a2f7-4e22-8ab3-7cf1dc6fec99', '33c3c4d7-2983-497b-b0ea-7ab817b46749', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('f439b573-c015-4a75-ada2-d9c0edd51b3c', 'eee27b5b-b426-49a9-854c-a52160bc2286', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('cb759655-4763-4c57-bdde-32802eec8303', '0c6715e2-7326-4dba-9ce0-c54fc49453c1', 82.81, 98.97, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 5.00, NULL, true),
('4946fcf2-95f7-4941-a5b6-45f61867e1ac', '002e0dea-430a-4939-b099-ad17a975d17a', NULL, NULL, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('750e1bfe-9540-444b-9584-8d8009e08920', '342e67ed-88ff-43fd-bc31-ad9671297825', NULL, NULL, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('7d15637a-9c12-4275-b14e-dd4db42f47a2', 'e97aaef6-14fa-4fb5-a7d9-2d4caf666737', NULL, NULL, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('f8ebbd1d-c9b5-49d8-ba2f-8dddded6bd3e', '5291de96-f46b-4e80-83e6-c3189f1e27bb', NULL, NULL, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('cca7583d-cae9-442d-a2b1-6e8665c62bd1', '1fe7664d-f986-4057-8c71-8ce4a5703b9d', NULL, NULL, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('d8d53526-d623-4a94-908b-3ea272a10d79', 'ffe20a73-77a4-4317-ade3-841a5407f593', NULL, NULL, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('16262675-042f-4a83-8116-031df85a2cf0', '1189e9fe-ed35-429b-bf07-c7a8afff60fb', NULL, NULL, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('fdade865-8196-4624-a97b-abe9216ddf56', 'e094e815-2639-4962-be08-4a2b0e553fe2', NULL, NULL, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('b5e0f960-818c-4d53-a0ed-6a6323920480', 'ae9ce253-d962-4fe7-a90f-f8d5ba19d6df', 82.73, 55.38, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, 0.00, 0.00, NULL, false),
('8d55c053-8c20-4af7-b88c-832026136645', '37d82b67-b2a8-4a03-afa1-148cda5fc343', 80.00, 75.00, 30, 40, 200, 50, 30, 10, NULL, NULL, NULL, NULL, NULL, NULL),
('434632c0-cdd1-40f1-b7c3-6761f6b2f8ef', '1fc46cda-1de0-44b3-8203-0a2d0f410d99', 83.44, 277.26, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 5.00, NULL, false),
('e317a941-afb5-4e39-ae9c-51e733d66b2c', '11faca8f-db6c-4a71-ab9b-e93879e648c5', 83.41, 99.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, NULL, false),
('494bf739-20f5-4c82-b6c0-aa205bc0f4d0', '553062fc-8222-4976-875f-d97096e1df41', 80.00, 75.00, 30, 40, 200, 50, 30, 10, NULL, NULL, NULL, NULL, NULL, NULL),
('f450d555-7dd7-4832-9d99-8489c93a9435', '7785a65d-f043-47ab-8a6c-7a1aac6c0e75', 81.41, 98.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.16, 4.29, NULL, false),
('342f06fa-db29-4471-9a3f-e616d489c104', '02833b49-aad8-4f52-8fc4-3d9f580fd254', 81.41, 98.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.16, 4.29, NULL, false),
('a8b7a288-0c9d-4874-aaa0-26e583bbd661', '85478b2b-ef2c-4389-947a-5e16e8b839f6', 82.73, 55.38, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, 0.00, 0.00, NULL, false),
('04eae813-4eb6-419c-9872-b565d7826986', 'c031cab8-d931-4218-b349-627d1acad882', 83.44, 277.26, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 5.00, NULL, false),
('59df4ff1-3c10-4430-88db-1dda12c40940', 'e88be9ca-1c57-4794-8ae9-ed1b7e44a2ac', 82.81, 98.97, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 5.00, NULL, true),
('cab56591-9120-4acb-97fe-fc7b65c2db89', '4c6deab0-86c9-4379-aebc-da81308f4f6b', 100.00, 60.00, 15, 730, 30, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('79dc5d11-bd7c-420e-8636-b374968dfbce', '25cf1e16-b4d7-4c52-b469-abc0ba8036a4', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('3c36ed2f-16eb-492b-95b0-0910e2a57d96', '365ca69b-8ae5-491c-b513-c829c6df8ec3', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 197.40, NULL, NULL, NULL),
('34e356ab-2521-4945-a38a-aa2704ab7fdc', '1f510dce-c50b-4e6c-8545-c0936486c51b', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('b5469aee-0969-4df2-975a-85a26fd31473', '1a1d82a8-1c2f-4d86-ad81-181493e26359', 100.00, 60.00, 15, 730, 30, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('5098d3d9-53b8-49b0-a2af-ce5f69f9b4da', 'bf49a8cd-6037-474c-a48c-967ba992016c', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 197.40, NULL, NULL, NULL),
('5aae632d-7d9f-47ba-b61c-b17d38050ac5', 'a497c269-c0c8-4e7c-95dd-4aed27a7833e', 83.41, 99.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, NULL, false);

-- Insert container style starter pack
INSERT INTO "ngine"."container_style" ("id", "refId", "backgroundColor", "borderColor", "borderStyle", "borderWidth", "borderTopLeftRadius", "borderTopRightRadius", "borderBottomLeftRadius", "borderBottomRightRadius", "isBorderTopHidden", "isBorderRightHidden", "isBorderBottomHidden", "isBorderLeftHidden")
VALUES ('63fa3cb9-003c-4ac9-bd8e-9f9eac0911df', '00000000-0000-0000-0000-000000000000', '#2B2B2B', '#E8E8E8', 'solid', 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('89f71f80-a261-4cdb-9a82-abcdcefd6c27', '59461626-4489-499b-a0c0-f4262c3c8fbb', '#2B2B2B', '#E8E8E8', 'none', 2, 0, 0, 0, 0, false, false, false, false),
('528bb4bb-e9bd-4fbc-841e-d6a0dd78b43c', '8932e561-c5e0-4529-9a55-647f52fddbfd', '#2B2B2B', '#E8E8E8', 'none', 2, 0, 0, 0, 0, false, false, false, false),
('394ca704-6f63-44fa-80fd-12daedd44c8d', '25a51a84-a7e5-45c6-aef2-7718b02b9e9e', '#2B2B2B', '#E8E8E8', 'solid', 2, 20, 20, 20, 20, false, false, false, false),
('7dddff2d-2ae2-4c42-86ad-55e0b139ec86', '04f3a568-8741-4a11-ae0b-3b63241b7563', '#2B2B2B', '#E8E8E8', 'solid', 2, 20, 20, 20, 20, false, false, false, false),
('73c2aba4-0ffc-4c19-8ed1-dcf2cccff528', '9830d6b5-aca3-4d9b-905d-3d51846687e4', '#2B2B2B', '#E8E8E8', 'none', 2, 0, 0, 0, 0, false, false, false, false),
('dafed2fa-3bab-44b7-9234-9f1afb840006', '44752735-64eb-4227-a193-65dabd717376', '#2B2B2B', '#E8E8E8', 'none', 2, 0, 0, 0, 0, false, false, false, false),
('3bd9170b-e56b-47e1-815a-31f12f086f5a', '1fc46cda-1de0-44b3-8203-0a2d0f410d99', '#2B2B2B', '#E8E8E8', 'none', 2, 0, 0, 0, 0, false, false, false, false),
('3aead060-100e-4a4e-9576-d01f11feed2f', '33c3c4d7-2983-497b-b0ea-7ab817b46749', '#2B2B2B', '#E8E8E8', 'none', 2, 0, 0, 0, 0, false, false, false, false),
('6f3e1ce2-1094-4727-aee4-01d3a2f91830', 'eee27b5b-b426-49a9-854c-a52160bc2286', '#2B2B2B', '#E8E8E8', 'none', 2, 0, 0, 0, 0, false, false, false, false),
('8aca3abf-c849-4264-b68d-de7b5c91ed27', 'c031cab8-d931-4218-b349-627d1acad882', '#2B2B2B', '#E8E8E8', 'none', 2, 0, 0, 0, 0, false, false, false, false),
('71056c44-c617-4aec-bcd8-a2244e87a304', '002e0dea-430a-4939-b099-ad17a975d17a', '#2B2B2B', '#E8E8E8', 'none', 2, 0, 0, 0, 0, false, false, false, false),
('ed145c60-ee26-48b3-b3fc-4f9ec8b5fad9', '342e67ed-88ff-43fd-bc31-ad9671297825', '#2B2B2B', '#E8E8E8', 'none', 2, 0, 0, 0, 0, false, false, false, false),
('b647ba43-17b7-4d50-adbf-9e4f8eb28430', 'e97aaef6-14fa-4fb5-a7d9-2d4caf666737', '#2B2B2B', '#E8E8E8', 'none', 2, 0, 0, 0, 0, false, false, false, false),
('702aa016-987b-4e58-bdc0-d95903b107b4', '5291de96-f46b-4e80-83e6-c3189f1e27bb', '#2B2B2B', '#E8E8E8', 'none', 2, 0, 0, 0, 0, false, false, false, false),
('723c341d-32f3-414f-bd0b-5d460cc75445', '1fe7664d-f986-4057-8c71-8ce4a5703b9d', '#2B2B2B', '#E8E8E8', 'none', 2, 0, 0, 0, 0, false, false, false, false),
('40b2d3a9-5b50-4230-8724-2302978257c0', 'ffe20a73-77a4-4317-ade3-841a5407f593', '#2B2B2B', '#E8E8E8', 'none', 2, 0, 0, 0, 0, false, false, false, false),
('d36d1444-b011-45b7-a1e7-ad03ee4d5d70', '1189e9fe-ed35-429b-bf07-c7a8afff60fb', '#2B2B2B', '#E8E8E8', 'none', 2, 0, 0, 0, 0, false, false, false, false),
('145c5e00-623a-4935-a791-4fca4bc42d02', 'e094e815-2639-4962-be08-4a2b0e553fe2', '#2B2B2B', '#E8E8E8', 'none', 2, 0, 0, 0, 0, false, false, false, false),
('62386eb7-faf7-4f69-95f3-7aa901fe08d1', '37d82b67-b2a8-4a03-afa1-148cda5fc343', '#2B2B2B', '#E8E8E8', 'solid', 2, 20, 20, 20, 20, false, false, false, false),
('081c84b7-136f-4e4d-a239-ea5c5c72b9c6', '553062fc-8222-4976-875f-d97096e1df41', '#2B2B2B', '#E8E8E8', 'solid', 2, 20, 20, 20, 20, false, false, false, false),
('e1bea241-3417-4e79-b4e0-4cf0a34f14b0', '11faca8f-db6c-4a71-ab9b-e93879e648c5', '#2B2B2B', '#E8E8E8', 'none', 2, 0, 0, 0, 0, false, false, false, false),
('86cc5f67-b0dc-4035-89f4-8e82ffe1a726', 'ae9ce253-d962-4fe7-a90f-f8d5ba19d6df', '#2B2B2B', '#E8E8E8', 'none', 1, 0, 0, 0, 0, false, false, false, false),
('0db99cb1-4e45-44a9-8c7d-81cc10ad8186', 'e88be9ca-1c57-4794-8ae9-ed1b7e44a2ac', '#2B2B2B', '#E8E8E8', 'solid', 1, 0, 0, 0, 0, false, false, false, false),
('d6a232c2-f772-4fed-b9d6-e933d095fd4c', 'e625457f-ce9e-495c-9438-d0732d076381', '#2B2B2B', '#E8E8E8', 'none', 2, 0, 0, 0, 0, false, false, false, false),
('94abead3-a05a-42da-b051-1b8f7c78e6a4', 'b9c9307f-aed2-4a33-9d2f-16df48213d6f', '#2B2B2B', '#E8E8E8', 'none', 2, 0, 0, 0, 0, false, false, false, false),
('5312cc79-2d93-45e9-a823-866c3b1c333c', '7785a65d-f043-47ab-8a6c-7a1aac6c0e75', '#2B2B2B', '#E8E8E8', 'none', 1, 0, 0, 0, 0, false, false, false, false),
('21a9d266-9222-45b3-84e3-bae40e3776e5', '4c6deab0-86c9-4379-aebc-da81308f4f6b', '#2B2B2B', '#E8E8E8', 'solid', 2, 0, 0, 0, 0, true, true, false, true),
('dd9bc90e-3c34-4ba9-92a4-0a2b8fc01820', '02833b49-aad8-4f52-8fc4-3d9f580fd254', '#2B2B2B', '#E8E8E8', 'none', 1, 0, 0, 0, 0, false, false, false, false),
('49a3616c-575b-4c9f-8d68-2aa08d406305', '0c6715e2-7326-4dba-9ce0-c54fc49453c1', '#2B2B2B', '#E8E8E8', 'solid', 1, 0, 0, 0, 0, false, false, false, false),
('d4cbb43a-0e95-4493-9063-4e1d3a7c4524', '25cf1e16-b4d7-4c52-b469-abc0ba8036a4', '#2B2B2B', '#E8E8E8', 'none', 2, 0, 0, 0, 0, false, false, false, false),
('e749dc01-6eac-4414-a45b-bae89bc6c6c1', '365ca69b-8ae5-491c-b513-c829c6df8ec3', '#2B2B2B', '#E8E8E8', 'none', 2, 0, 0, 0, 0, false, false, false, false),
('503ef4b5-6b90-4f51-937d-f5a9069773c6', '1f510dce-c50b-4e6c-8545-c0936486c51b', '#2B2B2B', '#E8E8E8', 'none', 2, 0, 0, 0, 0, false, false, false, false),
('1a552c17-d09e-4f0c-b0c8-696eca935363', '1a1d82a8-1c2f-4d86-ad81-181493e26359', '#2B2B2B', '#E8E8E8', 'solid', 2, 0, 0, 0, 0, true, true, false, true),
('a12fb603-6be8-4f7d-98dd-4c78a31a1a47', '85478b2b-ef2c-4389-947a-5e16e8b839f6', '#2B2B2B', '#E8E8E8', 'none', 1, 0, 0, 0, 0, false, false, false, false),
('7cafcc67-452d-4a51-996f-a06ad5a25692', 'bf49a8cd-6037-474c-a48c-967ba992016c', '#2B2B2B', '#E8E8E8', 'none', 2, 0, 0, 0, 0, false, false, false, false),
('9ff5fcbf-3931-4c13-ac10-7c3fee45b443', 'a497c269-c0c8-4e7c-95dd-4aed27a7833e', '#2B2B2B', '#E8E8E8', 'none', 2, 0, 0, 0, 0, false, false, false, false);

-- Insert typography style starter pack
INSERT INTO "ngine"."typography_style" ("id", "refId", "fontFamily", "fontSize", "fontWeight", "color", "activeColor")
VALUES ('dbb1faeb-04c2-473a-92c9-7d077cf14f04', '00000000-0000-0000-0000-000000000000', 'Open Sans', 16, 400, '#E8E8E8', '#985ab5'),
('4278d30c-d60b-425f-8337-3fd8cf94ea3b', '59461626-4489-499b-a0c0-f4262c3c8fbb', 'Open Sans', 26, 400, '#E8E8E8', '#985ab5'),
('77459b19-1166-4630-affb-39429fa07f59', '8932e561-c5e0-4529-9a55-647f52fddbfd', 'Open Sans', 16, 400, '#E8E8E8', '#985ab5'),
('69e92986-820f-49bc-b0b7-3473b6dd0b5b', '9830d6b5-aca3-4d9b-905d-3d51846687e4', 'Open Sans', 16, 400, '#E8E8E8', '#985ab5'),
('5e3911c0-77d9-4fef-b517-42fdcf5e4f7a', '44752735-64eb-4227-a193-65dabd717376', 'Open Sans', 26, 400, '#E8E8E8', '#985ab5'),
('399c5103-6be9-4080-83e7-6f5bf00083f1', 'c031cab8-d931-4218-b349-627d1acad882', 'Open Sans', 16, 400, '#E8E8E8', '#985ab5'),
('0a5b3c51-40ee-4fac-89ae-b7d2d19174f2', '33c3c4d7-2983-497b-b0ea-7ab817b46749', 'Open Sans', 26, 400, '#E8E8E8', '#985ab5'),
('584792f0-fc90-449b-a219-a6602fc548b5', 'eee27b5b-b426-49a9-854c-a52160bc2286', 'Open Sans', 26, 400, '#E8E8E8', '#985ab5'),
('3e3461a8-fa9c-402e-96bb-5c052e18d622', 'e625457f-ce9e-495c-9438-d0732d076381', 'Open Sans', 16, 400, '#E8E8E8', '#985ab5'),
('9cf1b310-df34-4267-8469-64ba6297b93d', '002e0dea-430a-4939-b099-ad17a975d17a', 'Open Sans', 26, 400, '#E8E8E8', '#985ab5'),
('c3040783-9626-40ef-8331-82e3ea4d3ca3', '342e67ed-88ff-43fd-bc31-ad9671297825', 'Open Sans', 26, 400, '#E8E8E8', '#985ab5'),
('9aa38525-d8ea-42d6-8e5a-c42c4d19e5b4', 'e97aaef6-14fa-4fb5-a7d9-2d4caf666737', 'Open Sans', 26, 400, '#E8E8E8', '#985ab5'),
('2e157779-1e16-46d2-a4cb-cf1e3ad346a3', '5291de96-f46b-4e80-83e6-c3189f1e27bb', 'Open Sans', 26, 400, '#E8E8E8', '#985ab5'),
('f6fd6d34-dbe2-42ed-b630-54973058f42e', '1fe7664d-f986-4057-8c71-8ce4a5703b9d', 'Open Sans', 26, 400, '#E8E8E8', '#985ab5'),
('8d78dce6-a90a-4f21-b868-065827939994', 'ffe20a73-77a4-4317-ade3-841a5407f593', 'Open Sans', 26, 400, '#E8E8E8', '#985ab5'),
('4ec4d64f-6aea-4628-830b-e2614fb5638b', '1189e9fe-ed35-429b-bf07-c7a8afff60fb', 'Open Sans', 26, 400, '#E8E8E8', '#985ab5'),
('c0e73d1f-673c-4d0a-962a-809f152bf112', 'e094e815-2639-4962-be08-4a2b0e553fe2', 'Open Sans', 26, 400, '#E8E8E8', '#985ab5'),
('356342df-c4c6-46fc-bebd-5adb5fd7dd6b', 'b9c9307f-aed2-4a33-9d2f-16df48213d6f', 'Open Sans', 16, 400, '#E8E8E8', '#985ab5'),
('00d69c6b-9525-4428-8ea6-a6d1e68b64a2', '7785a65d-f043-47ab-8a6c-7a1aac6c0e75', 'Open Sans', 16, 400, '#E8E8E8', '#985ab5'),
('1e7d79c5-fa1e-4991-83b9-54949bcf681c', '02833b49-aad8-4f52-8fc4-3d9f580fd254', 'Open Sans', 16, 400, '#E8E8E8', '#985ab5'),
('c4e9d3bd-ccec-45e4-b474-d36b989d2512', 'e88be9ca-1c57-4794-8ae9-ed1b7e44a2ac', 'Open Sans', 16, 400, '#E8E8E8', '#e8e8e8'),
('ecdfcfb5-76b5-4f1f-a2ca-ad2600837b29', '0c6715e2-7326-4dba-9ce0-c54fc49453c1', 'Open Sans', 16, 400, '#E8E8E8', '#e8e8e8'),
('83b8409b-0b42-4ba1-b89b-3353116c8714', '11faca8f-db6c-4a71-ab9b-e93879e648c5', 'Open Sans', 16, 400, '#E8E8E8', '#985ab5'),
('67be76df-3e98-43d2-9884-cd54b9a553c8', 'ae9ce253-d962-4fe7-a90f-f8d5ba19d6df', 'Open Sans', 16, 400, '#E8E8E8', '#e8e8e8'),
('6ac93831-c250-4206-951a-dd189dda4c11', '25cf1e16-b4d7-4c52-b469-abc0ba8036a4', 'Open Sans', 18, 400, '#E8E8E8', '#985ab5'),
('f6480e7a-ec66-45c5-9c26-b3e1f414692b', '365ca69b-8ae5-491c-b513-c829c6df8ec3', 'Open Sans', 18, 400, '#E8E8E8', '#985ab5'),
('a0f119cb-d753-41ff-8ee9-2543a08502e1', '1f510dce-c50b-4e6c-8545-c0936486c51b', 'Open Sans', 18, 400, '#E8E8E8', '#985ab5'),
('90fee4ef-676d-4989-aef7-84413b92db5c', '85478b2b-ef2c-4389-947a-5e16e8b839f6', 'Open Sans', 16, 400, '#E8E8E8', '#e8e8e8'),
('34170118-ede3-4cb2-b877-ceb4a2a8c015', 'bf49a8cd-6037-474c-a48c-967ba992016c', 'Open Sans', 18, 400, '#E8E8E8', '#985ab5'),
('0588615f-c534-485d-b331-c33ba2e36da2', 'a497c269-c0c8-4e7c-95dd-4aed27a7833e', 'Open Sans', 16, 400, '#E8E8E8', '#985ab5'),
('6c74cfb4-4efc-4620-bed5-adc1de62c02a', '1fc46cda-1de0-44b3-8203-0a2d0f410d99', 'Open Sans', 16, 400, '#E8E8E8', '#985ab5');

-- Insert permissions --
INSERT INTO "ngine"."permission" ("name", "priority")
VALUES ('Can view', 3), ('Can view and edit', 2), ('Can view, edit and delete', 1);

-- Insert super admin role --
INSERT INTO "ngine"."role" ("name", "displayLabel", "description", "isDisabled")
VALUES ('super-admin', 'Super Admin', 'Super admin role', false);

-- Insert super admin role navigation permission --
INSERT INTO "ngine"."role_navigation_permission" ("roleId", "navigationGroupId", "permissionId")
VALUES (
	(select id from "ngine"."role" where name = 'super-admin'),
    '00000000-0000-0000-0000-000000000000',
    (select id from "ngine"."permission" where priority = 1)
);

-- Insert guest role --
INSERT INTO "ngine"."role" ("name", "displayLabel", "description", "isDisabled")
VALUES ('guest', 'Guest', 'This role is assigned only to users without account.', false);

-- Insert guest role navigation permission (only view permission on 'WELCOME' navigation) --
INSERT INTO "ngine"."role_navigation_permission" ("roleId", "navigationGroupId", "permissionId")
VALUES (
	(select id from "ngine"."role" where "name" = 'guest'),
    '33aa1a39-e1aa-421b-9056-5ef15bc93069',
    (select id from "ngine"."permission" where priority = 3)
);

-- insert guest user --
INSERT INTO "ngine"."user" ("name", "lastName", "emailAddress")
VALUES ('guest', 'Guest', 'guest@guest.com');

-- insert guest user role
INSERT INTO "ngine"."user_role" ("userId", "roleId")
VALUES (
	(select id from "ngine"."user" where "name" = 'guest'),
    (select id from "ngine"."role" where "name" = 'guest')
);

-- Insert app setting background color --
INSERT INTO "ngine"."app_setting" ("settingName", "settingValue")
VALUES ('backgroundColor', '#2B2B2B');
