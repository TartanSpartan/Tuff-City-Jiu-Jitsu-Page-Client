FROM node:16.20.1

WORKDIR /client
# COPY package*.json ./ #!!!the "." is important!!

# install app dependencies

COPY package.json /client/package.json
COPY package-lock.json /client/package-lock.json
RUN npm cache clean --force
RUN npm install -g npm@9.8.1
RUN npm install --save
RUN npm ls webpack 
# RUN npm audit fix
RUN npm cache clean --force

# add app
COPY . ./
ENV NODE_ENV development
EXPOSE 5500

# start app
CMD ["npm", "dev", "start"] 