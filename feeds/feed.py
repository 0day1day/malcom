import os, sys
from toolbox import debug_output
from datetime import timedelta, datetime



class Feed(object):
	"""This is a feed base class. All other feeds must inherit from this class"""
	def __init__(self, name, run_every="24h"):
		self.name = name

		# parse timedelta
		num = int(run_every[:-1])
		if run_every.endswith('s'):
			self.run_every = timedelta(seconds=num)
		if run_every.endswith('m'):
			self.run_every = timedelta(minutes=num)
		if run_every.endswith('h'):
			self.run_every = timedelta(hours=num)
		if run_every.endswith('d'):
			self.run_every = timedelta(days=num)

		self.last_run = None
		self.next_run = None
		self.running = False
		self.last_run_time = None
		self.elements_fetched = 0
		self.status = "OK"

	def run(self, analytics):

		self.running = True
		self.last_run = datetime.now()
		self.next_run = self.last_run + self.run_every

		if self.get_info():
			self.analytics(analytics)

		self.running = False



class FeedEngine(object):
	"""Feed engine. This object will load, update, and analyze feeds"""
	def __init__(self, analytics):
		self.a = analytics
		self.feeds = {}

	def run_feed(self, feed_name):
		feed = self.feeds[feed_name]
		feed.run(self.a)


	def load_feeds(self):
	
		globals_, locals_ = globals(), locals()

		file = os.path.abspath(__file__)
		malcom_directory = os.path.dirname(file)
		
		package_name = 'feeds'
		feeds_dir = malcom_directory + '/' + package_name

		feeds_dir = malcom_directory
		debug_output("Loading feeds in %s" % feeds_dir)
		
		for filename in os.listdir(feeds_dir):
			export_names = []
			export_classes = []

			modulename, ext = os.path.splitext(filename)
			if modulename[0] != "_" and ext in ['.py']:
				subpackage = '%s.%s' % (package_name, modulename)
				
				module = __import__(subpackage, globals_, locals_, [modulename])

				modict = module.__dict__

				names = [name for name in modict if name[0] != '_']
				
				for n in names:
					if n == 'Feed':
						continue
					class_n = modict.get(n)
				 	try:
				 		if issubclass(class_n, Feed) and class_n not in globals_:
				 			sys.stderr.write(" + Loading %s..." % n)
				 			new_feed = class_n(n) # create new feed object
				 			self.feeds[n] = new_feed

				 			# this may be for show for now
				 			export_names.append(n)
				 			export_classes.append(class_n)

				 	except Exception, e:
				 		pass

		globals_.update((export_names[i], c) for i, c in enumerate(export_classes))

		return export_names, export_classes









