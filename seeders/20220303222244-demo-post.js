'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Posts', [{
      title: 'post 1',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Id diam vel quam elementum. Nunc scelerisque viverra mauris in aliquam sem fringilla. Dui sapien eget mi proin. Aliquam id diam maecenas ultricies mi eget mauris pharetra. Nunc sed blandit libero volutpat sed cras ornare arcu. Turpis massa tincidunt dui ut. Morbi tempus iaculis urna id volutpat lacus laoreet non curabitur. Sagittis eu volutpat odio facilisis. Sapien faucibus et molestie ac. Consectetur adipiscing elit duis tristique sollicitudin nibh sit amet. Mattis enim ut tellus elementum sagittis. Et egestas quis ipsum suspendisse ultrices gravida dictum fusce ut. Praesent tristique magna sit amet purus gravida quis blandit turpis. Turpis egestas integer eget aliquet nibh praesent tristique. Interdum velit euismod in pellentesque massa. Vulputate mi sit amet mauris commodo. Morbi enim nunc faucibus a pellentesque sit.', 
      createdAt: new Date(), 
      updatedAt: new Date()
    }, {
      title: 'post 2',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Id diam vel quam elementum. Nunc scelerisque viverra mauris in aliquam sem fringilla. Dui sapien eget mi proin. Aliquam id diam maecenas ultricies mi eget mauris pharetra. Nunc sed blandit libero volutpat sed cras ornare arcu. Turpis massa tincidunt dui ut. Morbi tempus iaculis urna id volutpat lacus laoreet non curabitur. Sagittis eu volutpat odio facilisis. Sapien faucibus et molestie ac. Consectetur adipiscing elit duis tristique sollicitudin nibh sit amet. Mattis enim ut tellus elementum sagittis. Et egestas quis ipsum suspendisse ultrices gravida dictum fusce ut. Praesent tristique magna sit amet purus gravida quis blandit turpis. Turpis egestas integer eget aliquet nibh praesent tristique. Interdum velit euismod in pellentesque massa. Vulputate mi sit amet mauris commodo. Morbi enim nunc faucibus a pellentesque sit.', 
      createdAt: new Date(), 
      updatedAt: new Date()
    }, {
      title: 'post 3',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Id diam vel quam elementum. Nunc scelerisque viverra mauris in aliquam sem fringilla. Dui sapien eget mi proin. Aliquam id diam maecenas ultricies mi eget mauris pharetra. Nunc sed blandit libero volutpat sed cras ornare arcu. Turpis massa tincidunt dui ut. Morbi tempus iaculis urna id volutpat lacus laoreet non curabitur. Sagittis eu volutpat odio facilisis. Sapien faucibus et molestie ac. Consectetur adipiscing elit duis tristique sollicitudin nibh sit amet. Mattis enim ut tellus elementum sagittis. Et egestas quis ipsum suspendisse ultrices gravida dictum fusce ut. Praesent tristique magna sit amet purus gravida quis blandit turpis. Turpis egestas integer eget aliquet nibh praesent tristique. Interdum velit euismod in pellentesque massa. Vulputate mi sit amet mauris commodo. Morbi enim nunc faucibus a pellentesque sit.', 
      createdAt: new Date(), 
      updatedAt: new Date()
    }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Posts', null, {});
  }
};