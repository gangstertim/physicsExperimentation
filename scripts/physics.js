//http://jsfiddle.net/Razor/PaRCj/4/

Physics(function(world){
	/************* Parameters ************/
	var CANVAS_WIDTH = 500, CANVAS_HEIGHT = 500;
	var bounds = Physics.aabb(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	var renderer = Physics.renderer('canvas', {
	    el: 'viewport', // id of the canvas element
	    width: CANVAS_WIDTH,
	    height: CANVAS_HEIGHT
	});
	var colors = ['#1BA1E2', '#A05000', '#339933',
				  '#A2C139', '#D80073', '#F09609',
				  '#E671B8', '#A200FF', '#E51400',
				  '#00ABA9'];
	var dataArray = [ 
		{ 'name': 'tom',
		  'dist': 100,
		  'group': 1 }, 
		{ 'name': 'jane',
		  'dist': 200,
		  'group': 1 },
		{ 'name': 'sally',
		  'dist': 150,
		  'group': 2 },
		{ 'name': 'buttfucker',
		  'dist': 150,
		  'group': 3 },
		{ 'name': 'joe',
		  'dist': 275,
		  'group': 2 }
	];
	// subscribe to ticker to advance the simulation
	Physics.util.ticker.on(function( time, dt ){
    	world.step( time );
	});
	Physics.util.ticker.start();


	/************ Bodies ****************/
	var nodes = [];
	$(dataArray).each(function(i, el){
		var dNode = Physics.body('circle', {
			x: 100*i,
			y: 100,
			radius: 25,
			vx: el.dist/5000,
			styles: {
				fillStyle: colors[el.group]
			},
			dist: el.dist
		});
		nodes.push(dNode);
	});
	var userNode = Physics.body('circle', {
		x: CANVAS_WIDTH/2,
		y: CANVAS_HEIGHT/2,
		radius: 50,
		treatment: "static",
		styles: {
			fillStyle: colors[5]
		}
	});

	/*************** Behaviors *************/
	var edgeCollision = Physics.behavior('edge-collision-detection', {
	    aabb: bounds,
	    restitution: 0.3
	});
	var bodyImpulseResponse = Physics.behavior('body-impulse-response');
	var bodyCollisionDetection = Physics.behavior('body-collision-detection');
	var attractor = Physics.behavior('attractor', {
		pos: {'x': CANVAS_HEIGHT/2, 'y': CANVAS_WIDTH/2},
		strength: 5,
		max: false, //infinite
		min: 100
	});
	//handles distance contraints
	var verletConstraints = Physics.behavior('verlet-constraints', {
        iterations: 10
    });
    
    $(nodes).each(function(i, node) {
    	verletConstraints.distanceConstraint( userNode, node, 1, node.dist );
    });

	/*************** Populate world *******/
	bodyImpulseResponse.applyTo( nodes );
	attractor.applyTo( nodes );
	world.add( bodyImpulseResponse );
	world.add( attractor );
	world.add( renderer );
	//world.add( edgeCollision );
	world.add( bodyCollisionDetection );
	world.add( Physics.behavior('sweep-prune'));
	world.add( verletConstraints );
	
	world.add( userNode );
	for (node in nodes) {
		world.add( nodes[node] );
	}

	world.on('step', function(){
    	world.render();
	});
});