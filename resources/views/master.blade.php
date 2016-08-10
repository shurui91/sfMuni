<html>
	<head>
	<!-- display the value of the title -->
	<title>@yield('title')</title>
	</head>
	<body>
		<!-- define a section named sidebar -->
		@section('sidebar')
		This is the master sidebar.
		
		<!-- display the contents of a section -->
		@show
		<div class="container">
			<!-- display the contents of content -->
			@yield('content')
		</div>
	</body>
</html>