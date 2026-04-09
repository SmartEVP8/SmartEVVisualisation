# Smart EV Visualisation

Frontend for the SmartEV project.

## Setup

Install dependencies:

```bash
npm install
```

Create a copy of the .env file

```bash
cp .env.example .env
```

Remember to update the MapTiler API key.
<br>
Go to https://cloud.maptiler.com/maps/
<br>
To generate an API key.

## Protobuf

For the project to work you need to have a generated api_pb.ts file.
<br>
You can generate this by running this command:

```bash
npm run proto:generate
```

**MAKE SURE THAT THE PROTOBUF FILE MATCHES THE C# PROJECT**

## Running the project

Command:

```bash
npm run dev
```
