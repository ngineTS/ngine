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


-- Insert navigation types --
INSERT INTO "ngine"."navigation_type" ("name", "displayLabel", "description", "thumbnailImage")
VALUES ('dialog-button', 'Dialog Button', 'Open a dialog on click.', 'dialog-button.png'),
	('external-link-button', 'External Link Button', 'Open url on new page on click.', 'external-link-button.png'),
	('redirect-button', 'Redirect Button', 'Navigate to route name on click.', 'redirect-button.png'),
	('menu-button', 'Menu Button', 'Open a menu on click.', 'menu-button.png'),
	('role-management', 'Role Management', 'Manage your roles.', 'role-management.png'),
	('user-management', 'User Management', 'Manage your users.', 'user-management.png'),
	('media-library', 'Media Library', 'Find and manage all the files uploaded.', 'media-library.png'),
	('analytic', 'Analytic', 'Find essential metrics related to your aplplication.', 'analytic.png'),
	('content-visualization', 'Content Visualization', 'Visualize your tables.', 'table-viz.png'),
	('calendar', 'Calendar', 'Publish information into a calendar including text, files...', 'calendar.png'),
	('my-quill-editor', 'Text Editor', 'Text editor to post information.', 'quill-editor.png'),
	('sign-container', 'User Authentication', 'Sign-in / Sign-up form', 'sign-container.png'),
    ('simple-shape', 'Simple shape', 'A simple shape that can contains text and picture.', 'simple-shape.png'),
	('media', 'Media', 'video, image, audio, documents...', 'media-default.png'),
	('reusable-card-list', 'Reusable card list', 'A simple item management feature that allows users to add, edit, delete, and reorder items.', 'card-list.png'),
    ('authentication-management', 'Custom Authentication Popup', 'Custom your autentication popup by conneting your app to Stripe and propose paid packs to your users.', 'custom-auth-popup.png'),
    ('banner-management', 'Banner Management', 'Show important information to your users in the different sections of the application.', 'banner.png'),
	('ngine-guide', 'Ngine Guide', 'The startup guide of Ngine.', 'ngine-guide.png'),
;

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

-- Insert guest role navigation permission --
INSERT INTO "ngine"."role_navigation_permission" ("roleId", "navigationGroupId", "permissionId")
VALUES (
	(select id from "ngine"."role" where "name" = 'guest'),
    '00000000-0000-0000-0000-000000000000',
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

-- Insert roots navigations --
INSERT INTO ngine."navigation" ("id", "groupId", "isDraft", "name", "displayLabel", "order", "navigationTypeId", "parentGroupId")
VALUES (
	'00000000-0000-0000-0000-000000000000',
	'00000000-0000-0000-0000-000000000000',
	false,
	'global',
	'Global',
	0,
	(select id from "ngine".navigation_type where name = 'redirect-button'), 
	null
);

INSERT INTO ngine."navigation" ("id", "groupId", "isDraft", "name", "displayLabel", "order", "navigationTypeId", "parentGroupId")
VALUES (
	'11111111-1111-1111-1111-111111111111',
	'00000000-0000-0000-0000-000000000000',
	true,
	'global',
	'Global',
	0,
	(select id from "ngine".navigation_type where name = 'redirect-button'), 
	null
);

-- Insert app setting background color --
INSERT INTO "ngine"."app_setting" ("settingName", "settingValue")
VALUES ('backgroundColor', '#2B2B2B');

-- Insert default container style --
INSERT INTO "ngine"."container_style" ("refId", "backgroundColor", "borderWidth", "borderColor", "borderStyle")
VALUES ('00000000-0000-0000-0000-000000000000', '#2B2B2B', 2, '#E8E8E8', 'solid');

-- Insert default typography style --
INSERT INTO "ngine"."typography_style" ("refId", "fontFamily", "color", "activeColor", "fontSize", "fontWeight")
VALUES ('00000000-0000-0000-0000-000000000000', 'Open Sans', '#E8E8E8', '#985ab5', 16, 400);